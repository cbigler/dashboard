import moment from 'moment-timezone';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { AnalyticsDatapoint, QueryInterval } from '../../types/analytics';
import { TimeFilter, TimeOfDay } from '../../types/datetime';
import { DAYS_OF_WEEK } from '../datetime-utilities';
import { timeOfDayToMilliseconds, parseTimeString } from '../datetime-utilities/time-string';
import { ChartDataFetchingResult } from '../../rx-stores/analytics';

// simple time string of only HH:mm rather than handling HH:mm:ss or HH:mm:ss.sss
function parseSimpleTimeString(simpleTimeString: string): TimeOfDay {
  const [hourString, minuteString] = simpleTimeString.split(':');
  return {
    hour: Number(hourString),
    minute: Number(minuteString),
    second: 0,
    millisecond: 0,
  };
}

function dateISOStringToDate(dateString: string): Date {
  let [yearString, monthString, dayString] = dateString.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const day = Number(dayString);
  return new Date(year, monthIndex, day);
}

function dateToDateISOString(date: Date): string {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const monthNumber = monthIndex + 1;
  const monthString = `0${monthNumber}`.slice(-2);
  const dayString = `0${day}`.slice(-2);
  return `${year}-${monthString}-${dayString}`;
}

function getDayOfWeek(dateString: string) {
  // using a local Date object is fine here because we're just using it to get the day of the week
  const date = dateISOStringToDate(dateString);
  const dayOfWeekIndex = date.getDay();
  return DAYS_OF_WEEK[dayOfWeekIndex];
}

function subtractDay(dateString: string) {
  const date = dateISOStringToDate(dateString);
  // Taking advantage of the native Date object being nice about correcting things for you
  date.setDate(date.getDate() - 1);
  return dateToDateISOString(date);
}

export function processAnalyticsChartData(
  data: ChartDataFetchingResult,
  interval: QueryInterval,
  timeFilter: TimeFilter | undefined,
  spacesById: ReadonlyMap<string, CoreSpace>
): AnalyticsDatapoint[] {

  const now = Date.now();
  
  let sanitizedTimeFilterSegment: TimeFilter[number];
  if (timeFilter && timeFilter.length) {
    sanitizedTimeFilterSegment = timeFilter[0];
  } else {
    sanitizedTimeFilterSegment = {
      start: { hour: 0, minute: 0, second: 0, millisecond: 0 },
      end: { hour: 24, minute: 0, second: 0, millisecond: 0 },
      days: [...DAYS_OF_WEEK],
    }
  }

  const filterStartMs = timeOfDayToMilliseconds(sanitizedTimeFilterSegment.start);
  const filterEndMs = timeOfDayToMilliseconds(sanitizedTimeFilterSegment.end);
  const isOvernight = filterEndMs < filterStartMs;

  function isDayValidForTimeFilterSegment(dateString: string): boolean {
    const dayOfWeek = getDayOfWeek(dateString);
    return sanitizedTimeFilterSegment.days.includes(dayOfWeek);
  }

  function isTimeValidForTimeFilterSegment(timeString: string): boolean {
    const timeOfDay = parseSimpleTimeString(timeString);
    if (!timeOfDay) return false;
    const timeOfDayMs = timeOfDayToMilliseconds(timeOfDay);
    if (isOvernight) {
      return timeOfDayMs >= filterStartMs || timeOfDayMs <= filterEndMs;
    } else {
      return timeOfDayMs >= filterStartMs && timeOfDayMs <= filterEndMs;
    }
  }

  function getLocalBucketDay(localDay: string, localTime: string) {
    if (!isOvernight) return localDay;
    const timeOfDay = parseSimpleTimeString(localTime);
    if (!timeOfDay) {
      throw new Error(`Got an invalid time string: ${localTime}`)
    }
    const timeOfDayMs = timeOfDayToMilliseconds(timeOfDay);
    if (timeOfDayMs < filterStartMs) {
      return subtractDay(localDay);
    } else {
      return localDay;
    }
  }

  function getLocalBucketTime(localTime: string) {

    const timeOfDay = parseTimeString(localTime);
    if (!timeOfDay) {
      throw new Error('shit')
    }
    const timeOfDayMs = timeOfDayToMilliseconds(timeOfDay);

    // FIXME: this is going to have to be more complicated, but flooring the minutes for now
    const hour = isOvernight && (timeOfDayMs < filterStartMs) ? timeOfDay.hour + 24 : timeOfDay.hour;

    switch (interval) {
      case QueryInterval.FIVE_MINUTES: {
        throw new Error('5m interval is not available')
      }
      case QueryInterval.FIFTEEN_MINUTES: {
        const minute = timeOfDay.minute;
        const hourString = `0${hour}`.slice(-2)
        const minuteString = `0${minute}`.slice(-2);
        return `${hourString}:${minuteString}`;
      }
      case QueryInterval.ONE_HOUR: {
        const minute = 0;
        const hourString = `0${hour}`.slice(-2)
        const minuteString = `0${minute}`.slice(-2);
        return `${hourString}:${minuteString}`;
      }
      case QueryInterval.ONE_DAY:
      case QueryInterval.ONE_WEEK:
        return '00:00';
    }
  }


  const series = new Map<string, AnalyticsDatapoint[]>();

  Object.entries(data).forEach(([space_id, datapoints]) => {
    const space = spacesById.get(space_id);
    if (!space) { throw new Error(`No space found with id ${space_id}`) }
    const time_zone = space.time_zone;

    series.set(space_id, datapoints.reduce<AnalyticsDatapoint[]>((processed, d) => {
      const millisecondsSinceUnixEpoch = Date.parse(d.start)
      const m = moment.tz(millisecondsSinceUnixEpoch, time_zone);
      const localDay = m.format('YYYY-MM-DD');
      const localTime = m.format('HH:mm');

      // filter out future datapoints that the API sends back
      if (millisecondsSinceUnixEpoch > now) {
        return processed;
      }


      if (!isTimeValidForTimeFilterSegment(localTime)) {
        return processed;
      }

      const localBucketDay = getLocalBucketDay(localDay, localTime);
      const localBucketTime = getLocalBucketTime(localTime)

      if (!isDayValidForTimeFilterSegment(localBucketDay)) {
        return processed;
      }

      processed.push({
        space_id,
        space_name: space.name,
        millisecondsSinceUnixEpoch,
        time_zone: space.time_zone,
        localDay,
        localTime,
        localBucketDay,
        localBucketTime,
        
        min: d.analytics.min,
        max: d.analytics.max,
        entrances: d.analytics.entrances,
        exits: d.analytics.exits,
        events: d.analytics.events,

        utilization: d.analytics.utilization,
        target_utilization: d.analytics.target_utilization,

        opportunity: space.target_capacity ? space.target_capacity - d.analytics.max : null
      })
      return processed;
    }, []))
  })

  return Array.from(series.values()).reduce((a, b) => {
    a.push(...b)
    return a;
  }, []);

}
