import moment, { Moment } from 'moment';
import 'moment-timezone';

import { getGoSlow } from '../../components/environment-switcher';
import fetchAllObjects from '../fetch-all-objects';
import { DaysOfWeek } from '../../types';
import { QueryInterval } from '../../types/analytics';

// ----------------------------------------------------------------------------
// DATE STRING RELATED OPERATIONS
// ----------------------------------------------------------------------------
export function currentDateStringAtSpace(space) {
  return moment.tz(space.timeZone).format('YYYY-MM-DD');
}
export function parseDateStringAtSpace(dateString, space) {
  return moment.tz(dateString, space.timeZone);
}
export function serializeMomentToDateString(dateInstance) {
  return dateInstance.format('YYYY-MM-DD');
}


// ----------------------------------------------------------------------------
// DATE RANGE OPERATIONS
// ----------------------------------------------------------------------------
export enum RangeType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

export enum RelativeUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  QUARTERS = 'quarters',
  YEARS = 'years',
}

export enum RelativeDurationRound {
  START = 'START',
  END = 'END',
}

export type RelativeDuration = {
  magnitude: number,
  unit: RelativeUnit,
  round?: RelativeDurationRound,
}

export type RelativeDateRange = {
  type: RangeType.RELATIVE,
  start: RelativeDuration,
  end: RelativeDuration,
  label?: string, // Optional, used to name a given date range
}

export type AbsoluteDateRange = {
  type: RangeType.ABSOLUTE,
  startDate: string,
  endDate: string,
}

export type DateRange = AbsoluteDateRange | RelativeDateRange;

function makeDuration(magnitude, unit, round?): RelativeDuration {
  return { magnitude, unit, round };
}

// A list of predefined date ranges, using these avoids having to build custom date ranges for every
// use case.
export const DATE_RANGES: { [key: string]: RelativeDateRange } = {
  TODAY: {
    label: 'Today',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.DAYS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS, RelativeDurationRound.END),
  },
  YESTERDAY: {
    label: 'Yesterday',
    type: RangeType.RELATIVE,
    start: makeDuration(-1, RelativeUnit.DAYS, RelativeDurationRound.START),
    end: makeDuration(-1, RelativeUnit.DAYS, RelativeDurationRound.END),
  },
  LAST_7_DAYS: {
    label: 'Last 7 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(-7, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_WEEK: {
    label: 'Last Week',
    type: RangeType.RELATIVE,
    start: makeDuration(-1, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(-1, RelativeUnit.WEEKS, RelativeDurationRound.END),
  },
  WEEK_TO_DATE: {
    label: 'Week-to-Date',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_30_DAYS: {
    label: 'Last 30 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(-30, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_MONTH: {
    label: 'Last Month',
    type: RangeType.RELATIVE,
    start: makeDuration(-1, RelativeUnit.MONTHS, RelativeDurationRound.START),
    end: makeDuration(-1, RelativeUnit.MONTHS, RelativeDurationRound.END),
  },
  MONTH_TO_DATE: {
    label: 'Month-to-Date',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.MONTHS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_90_DAYS: {
    label: 'Last 90 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(-90, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },

  // Future time range example, not needed for analytics but an example of how we'd do this
  NEXT_WEEK: {
    label: 'Next Week',
    type: RangeType.RELATIVE,
    start: makeDuration(1, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(1, RelativeUnit.WEEKS, RelativeDurationRound.END),
  },
  NEXT_7_DAYS: {
    label: 'Next 7 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(7, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
};

const DAYS_OF_WEEK: Array<DaysOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function realizeDateRange(
  dateRange: DateRange,
  timeZone: string,
  opts: { organizationalWeekStartDay?: DaysOfWeek, now?: moment.Moment } = {},
): {startDate: moment.Moment, endDate: moment.Moment} {
  const organizationalWeekStartDay = opts.organizationalWeekStartDay || 'Sunday';
  const now = opts.now || moment.tz(timeZone);

  if (dateRange.type === RangeType.ABSOLUTE) {
    return {
      startDate: moment.tz(dateRange.startDate, timeZone).startOf('day'),
      endDate: moment.tz(dateRange.endDate, timeZone).endOf('day'),
    };
  } else {
    return {
      startDate: realizeRelativeDuration(dateRange.start, now, organizationalWeekStartDay).startOf('day'),
      endDate: realizeRelativeDuration(dateRange.end, now, organizationalWeekStartDay).endOf('day'),
    };
  }
}

function realizeRelativeDuration(
  relativeDuration: RelativeDuration,
  now: moment.Moment,
  organizationalWeekStartDay: DaysOfWeek,
): moment.Moment {
  let timestamp = now.clone().add(relativeDuration.magnitude, relativeDuration.unit);

  switch (relativeDuration.round) {
  case RelativeDurationRound.START:
    timestamp = timestamp.startOf(relativeDuration.unit);
    break;
  case RelativeDurationRound.END:
    timestamp = timestamp.endOf(relativeDuration.unit);
    break;
  }

  // Weeks are a special case because of "organization days of week start day" being a a concept
  // that can effect what day a week starts on
  if (relativeDuration.unit === RelativeUnit.WEEKS) {
    timestamp = timestamp.add(DAYS_OF_WEEK.indexOf(organizationalWeekStartDay), 'days');
  }
  return timestamp;
}


// ----------------------------------------------------------------------------
// TIME-RELATED OPERATIONS
// ----------------------------------------------------------------------------
export function getCurrentLocalTimeAtSpace(space) {
  return moment.utc().tz(space.timeZone);
}

export function convertDateToLocalTimeAtSpace(date, space) {
  return moment.tz(moment(date).format('YYYY-MM-DD'), space.timeZone);
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

export function formatInISOTime(timestamp) {
  return timestamp.utc().toISOString();
}
export function formatInISOTimeAtSpace(timestamp, space) {
  return timestamp.tz(space.timeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
}
export function formatForReactDates(momentInstance, space) {
  return momentInstance.tz(space.timeZone).startOf('day');
}
export function prettyPrintHoursMinutes(momentInstance) {
  return momentInstance.format('h:mma').slice(0, -1); /* am -> a */
}

// Given a "week start day", find the start of the most recent week before a timestamp
export function getStartOfWeek(timestamp, weekStart) {
  const weekStartDate = timestamp.clone().isoWeekday(weekStart || 'Sunday');
  if (weekStartDate > timestamp) { weekStartDate.subtract(7, 'days'); }
  weekStartDate.startOf('day');
  return weekStartDate;
}

// Given a formatted interval string, return it as a moment duration
export function parseIntervalAsDuration(interval: QueryInterval) {
  const durationUnits = { w: 'week', d: 'day', h: 'hour', m: 'minute', s: 'second' };
  const suffix = interval.slice(-1);
  const amount = parseInt(interval.slice(0, -1), 10);
  return moment.duration(amount, durationUnits[suffix]);
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
export function splitTimeRangeIntoSubrangesWithSameOffset(space, start, end, params={} as any) {
  // Convert start and end into moments
  start = moment.utc(start);
  end = moment.utc(end);
  const startTs = start.valueOf();
  const endTs = end.valueOf();
  const results: any[] = [];

  // Same defaults as API
  params.interval = params.interval || '1h';
  params.order = params.order || 'asc';
  const interval = parseIntervalAsDuration(params.interval);
  const reverse = params.order.toLowerCase() === 'desc';

  // Validate start and end timestamps
  if (start >= end) { throw Error("Start must be before end!"); }

  // Create a list of DST transitions within this range of (local) time
  const tz: any = moment.tz.zone(space.timeZone);
  const transitions = tz.untils.map((ts, index) => {
    return { index: index, until: moment.utc(ts) };
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

    // If querying days or weeks, shift the next interval to align with the new offset
    if (['d', 'w'].indexOf(params.interval.slice(-1)) > -1) {
      const shiftMinutes = tz.offsets[transition.index - 1] - tz.offsets[transition.index];
      const shift = moment.duration(shiftMinutes, 'minutes');
      reverse ? lastInterval.subtract(shift) : lastInterval.add(shift);
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

export async function requestCountsForLocalRange(space, start, end, params={}) {
  const subranges = splitTimeRangeIntoSubrangesWithSameOffset(space, start, end, params);
  return await subranges.map(subrange => {
    return fetchAllObjects(`/spaces/${space.id}/counts`, {
      params: {
        start_time: formatInISOTime(subrange.start),
        end_time: formatInISOTime(subrange.end),
        slow: getGoSlow(),
        ...params,
      }
    });
  }).reduce((promise, request, index) => {
    return promise.then(async results => {
      const subrangeData = await request;
      if (subranges[index].gap && results.length > 0 && subrangeData.length > 0) {
        // The gap bucket's metrics are combined with the last bucket in the array.
        const lastBucket = results.pop();
        const gapBucket = subrangeData[0];
        lastBucket.interval.analytics.entrances += gapBucket.interval.analytics.entrances;
        lastBucket.interval.analytics.exits += gapBucket.interval.analytics.exits;
        lastBucket.interval.analytics.events += gapBucket.interval.analytics.events;
        lastBucket.interval.analytics.max = Math.max(lastBucket.interval.analytics.max, gapBucket.interval.analytics.max);
        lastBucket.interval.analytics.min = Math.min(lastBucket.interval.analytics.min, gapBucket.interval.analytics.min);
        lastBucket.interval.end = gapBucket.interval.end;
        results.push(lastBucket);
      } else {
        // Normal buckets are appended to the end of the array.
        results = results.concat(subrangeData);
      }
      return results;
    });
  }, Promise.resolve([]));
}
