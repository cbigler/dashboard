import moment from 'moment';
import 'moment-timezone';

import fetchAllPages from '../fetch-all-pages/index';
import { core } from '../../client';

export function getCurrentLocalTimeAtSpace(space) {
  return moment.utc().tz(space.timeZone);
}

export function getDurationBetweenMomentsInDays(a, b) {
  return moment.duration(moment.utc(b).diff(moment.utc(a))).asDays();
}

export function parseISOTimeToUTC(timestamp) {
  return moment.utc(timestamp);
}

export function parseISOTimeAtSpace(timestamp, space) {
  if (!space) {
    throw new Error('parseISOTimeAtSpace requires a second argument specifying a space.');
  }
  return moment.utc(timestamp).tz(space.timeZone);
}
export function parseFromReactDates(momentInstance, space) {
  return momentInstance.tz(space.timeZone).startOf('day');
}

export function parseDayAtSpace(daystamp, space) {
  return moment.utc(daystamp, 'YYYY-MM-DDZ').tz(space.timeZone);
}

export function formatDayAtSpace(momentInstance, space) {
  return momentInstance.tz(space.timeZone).format('YYYY-MM-DDZ');
}

export function formatInISOTime(timestamp) {
  return timestamp.utc().format();
}
export function formatInISOTimeAtSpace(timestamp, space) {
  return timestamp.tz(space.timeZone).format();
}
export function formatForReactDates(momentInstance, space) {
  return momentInstance.tz(space.timeZone).startOf('day');
}
export function prettyPrintHoursMinutes(momentInstance) {
  return momentInstance.format('h:mma').slice(0, -1); /* am -> a */
}

// Given a moment duration, return it formatted as an interval that can be passed to the counts
// endpoint.
export function formatDurationAsInterval(duration) {
  if (Math.floor(duration.asDays()) === duration.asDays()) {
    return `${duration.asDays()}d`;
  } else if (Math.floor(duration.asHours()) === duration.asHours()) {
    return `${duration.asHours()}h`;
  } else if (Math.floor(duration.asMinutes()) === duration.asMinutes()) {
    return `${duration.asMinutes()}m`;
  } else {
    return `${duration.asSeconds()}s`;
  }
}

/*
 * A funtion that accepts a space, a time range, and an interval, and returns all continuous ranges
 * of time that exist in order to calculate "virtual count buckets" in the local space's time.
 *
 * Here's the problem: a daylight savings time adjustment can occur in the middle of a day, causing
 * data fetched with the counts endpoint with an even bucket size to return data that doesn't end in
 * the correct utc offset, even though it started in the correct utc offset.
 *
 * The solution is that we need to split up the time range into "subranges", where each cubrange has
 * a consistent utc offset. Each subrange's data is requested seperately, and at the end, the data
 * from both request's count buckets are used to create virtual count buckets.
 *
 * In the usual case, the data that is being fetched only has one utc offset, and as such, only one
 * request is needed:
 *
 * A                  Offset one                   B
 * |-----------------------------------------------|
 *
 * But, if requesting data from A to B where there is a daylight savings boundary in the
 * middle, the data will be split into two ranges, one for each utc offset:
 *
 * A       Offset one
 * |-----------------------|     Offset two        B
 *                         |-----------------------|
 *                     DST point
 *
 * However, there is still a problem wit this approach, and this only becmes visible once we divide
 * the data we've fetched into buckets. If we were to request data for buckets starting at the
 * beginning of each range, they'd be misaligned across daylight savings boundaries:
 *
 * A    1         2      3
 * |---------|---------|---|    4         5      6 B   <=== This is the first request
 *                         |---------|---------|---|   <=== This is the second request
 *                     DST point
 *
 * |         |         |         |         |         | <== Where the "vitual bucket" boundaries are
 *
 *                           ^      ^
 *                           |      |
 *      4 can't be in two of the final intervals! How do we know "how much" of 4 to put in each
 *      virtual bucket?
 *
 *
 *
 * Therefore, a second step is required to generate a third data request in between the daylight
 * savings boundary and an even multiple of the `interval` - ie, in the below, splitting what was
 * interval 4 up into 4 and 5:
 *
 * A    1         2      3
 * |---------|---------|---|   4
 *                         |-----|    5        6   B
 *                               |---------|-------|
 *                     DST point
 *
 * |         |         |         |         |         |
 *
 *    ^= This is where the boundaries of the intervals should be in the final request.
 *
 */
export function splitTimeRangeIntoSubrangesWithSameOffset(space, start, end, interval, order) {
  // Convert start and end into moments
  start = moment.utc(start);
  end = moment.utc(end);
  const startTs = start.valueOf();
  const endTs = end.valueOf();
  const results = [];

  // Same defaults as API
  interval = interval || moment.duration(3600000);
  const reverse = (order || 'asc').toLowerCase() === 'desc';

  // Validate start and end timestamps
  if (start >= end) { throw Error("Start must be before end!"); }

  // Create a list of DST transitions within this range of (local) time
  const tz = moment.tz.zone(space.timeZone);
  const transitions = tz.untils.map((ts, index) => {
    return {
      index: index,
      until: moment.utc(ts)
    }
  }).filter(ts => startTs < ts.until && ts.until < endTs);
  
  // Save the last segment and interval boundaries that we've processed so far
  let lastSegment = moment.utc(reverse ? end : start);
  let lastInterval = moment.utc(lastSegment);

  // Generate necessary segments to avoid each DST boundary
  while (transitions.length > 0) {

    // Depending on the order of results, we pull from either end of the transitions array
    const transition = reverse ? transitions.pop() : transitions.shift();
    const transitionPoint = transition.until;

    // Skip by "interval" in the correct order until we've either passed or reached the transition
    while (reverse ? lastInterval > transitionPoint : lastInterval < transitionPoint) {
      lastInterval = reverse ? lastInterval.subtract(interval) : lastInterval.add(interval);
    }

    // Create a subrange from the last segment to this transition, preserving "time forwards" order
    results.push({
      start: moment.utc(reverse ? transitionPoint : lastSegment),
      end: moment.utc(reverse ? lastSegment : transitionPoint),
      gap: false
    });

    // Adjust the next interval to shift to align with the new offset, if necessary
    if (interval > moment.duration(3600000)) {
      const shiftMinutes = tz.offsets[transition.index - 1] - tz.offsets[transition.index];
      const shift = moment.duration(shiftMinutes, 'minutes');
      lastInterval = reverse ? lastInterval.subtract(shift) : lastInterval.add(shift);
    }

    // If there is a gap before the next interval, it will need to be fetched separately
    if (lastInterval.valueOf() !== transitionPoint.valueOf()) {
      results.push({
        start: moment.utc(reverse ? lastInterval : transitionPoint),
        end: moment.utc(reverse ? transitionPoint : lastInterval),
        gap: true
      });
    }

    // Continue from the last even interval
    lastSegment = moment.utc(lastInterval);
  }

  // Add the last interval if necessary
  if (reverse ? start < lastSegment : end > lastSegment) {
    results.push({
      start: moment.utc(reverse ? start : lastSegment),
      end: moment.utc(reverse ? lastSegment : end),
      gap: false
    })
  }

  // Return array of subranges
  return results;
}

export async function requestCountsForLocalRange(space, start, end, interval, params={}) {
  const subranges = splitTimeRangeIntoSubrangesWithSameOffset(space, start, end, interval, params.order);
  
  let results = [];
  for (const subrange of subranges) {
    const subrangeData = await fetchAllPages(page => (
      core.spaces.counts({
        id: space.id,
        start_time: subrange.start.toISOString(),
        end_time: subrange.end.toISOString(),
        page,
        page_size: 1000,
        interval: formatDurationAsInterval(interval),
        ...params,
      })
    ));
    if (subrange.gap) {
      const lastBucket = results.pop();
      const gapBucket = subrangeData[0];
      lastBucket.interval.analytics.entrances += gapBucket.interval.analytics.entrances;
      lastBucket.interval.analytics.exits += gapBucket.interval.analytics.exits;
      lastBucket.interval.analytics.events += gapBucket.interval.analytics.events;
      lastBucket.interval.analytics.events += gapBucket.interval.analytics.events;
      lastBucket.interval.analytics.max = Math.max(lastBucket.interval.analytics.max, gapBucket.interval.analytics.max);
      lastBucket.interval.analytics.min = Math.min(lastBucket.interval.analytics.min, gapBucket.interval.analytics.min);
      lastBucket.interval.end = gapBucket.interval.end;
      results.push(lastBucket);
    } else {
      results = results.concat(subrangeData);
    }
  }
  return results;
}

// let space = {
//   name: "Foo",
//   timeZone: "America/New_York",
//   id: "spc_547459039458492970",
// };
//
// setTimeout(() => {
//   requestCountsForLocalRange(
//     space,
//     moment().subtract(2, 'weeks'),
//     moment(),
//     moment.duration(1, 'day')
//   )
//     .then(data => console.log('SUBRANGE data', data))
//     .catch(err => console.error('SUBRANGE error', err))
// }, 1000);
