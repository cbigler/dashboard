import { DayOfWeek } from '@density/lib-common-types';
import { TimeFilter, TimeOfDay } from '../../types/datetime';
import { QueryInterval } from '../../types/analytics';
import { timeOfDayToMilliseconds, millisecondsToTimeOfDay, MINUTE_MILLISECONDS, DAY_MILLISECONDS, HOUR_MILLISECONDS } from './time-string';
import { roundDownToMultiple, roundUpToMultiple } from '../math';

export function abbreviateDayOfWeek(dayOfWeek: DayOfWeek) {
  switch (dayOfWeek) {
    case 'Sunday': return 'Sun';
    case 'Monday': return 'Mon';
    case 'Tuesday': return 'Tue';
    case 'Wednesday': return 'Wed';
    case 'Thursday': return 'Thu';
    case 'Friday': return 'Fri';
    case 'Saturday': return 'Sat';
  }
}
export type AbbreviatedDayOfWeek = ReturnType<typeof abbreviateDayOfWeek>;

export function expandDayOfWeek(abbreviation: AbbreviatedDayOfWeek): DayOfWeek | undefined {
  switch (abbreviation) {
    case 'Sun': return DayOfWeek.SUNDAY;
    case 'Mon': return DayOfWeek.MONDAY;
    case 'Tue': return DayOfWeek.TUESDAY;
    case 'Wed': return DayOfWeek.WEDNESDAY;
    case 'Thu': return DayOfWeek.THURSDAY;
    case 'Fri': return DayOfWeek.FRIDAY;
    case 'Sat': return DayOfWeek.SATURDAY;
  }
}

function formatTimeOfDayForQueryString(timeOfDay: TimeOfDay) {
  const hourString = `0${timeOfDay.hour}`.slice(-2);
  const minuteString = `0${timeOfDay.minute}`.slice(-2);
  return hourString + minuteString;
}

/**
 * Serializes a TimeFilter object into a format suitable for a query string
 * eg. 'Fri+Sat:0900-1800'
 */
export function serializeTimeFilter(timeFilter: TimeFilter) {
  return timeFilter.map(segment => {
    const days = segment.days.map(abbreviateDayOfWeek).join('+');
    const startTimeString = formatTimeOfDayForQueryString(segment.start);
    
    // FIXME: we should discuss this whole concept further.. for now 2400 should be respelled 0000
    //  which means that 0000-0000 is 24 hours long, not 0
    let endTimeString = formatTimeOfDayForQueryString(segment.end);
    if (endTimeString === '2400') {
      endTimeString = '0000'
    }

    const times = `${startTimeString}-${endTimeString}`
    return `${days}:${times}`
  }).join(',')
}

function snapTimeFilterSegmentToMinutes(segment: TimeFilter[number], minutes: number): TimeFilter[number] {
  return {
    ...segment,
    start: millisecondsToTimeOfDay(
      Math.max(
        0,
        roundDownToMultiple(
          timeOfDayToMilliseconds(segment.start), minutes * MINUTE_MILLISECONDS
        )
      )
    ),
    end: millisecondsToTimeOfDay(
      Math.min(
        DAY_MILLISECONDS,
        roundUpToMultiple(
          timeOfDayToMilliseconds(segment.end), minutes * MINUTE_MILLISECONDS
        )
      )
    ),
  }
}
function snapTimeFilterSegmentToHour(segment: TimeFilter[number]): TimeFilter[number] {
  return {
    ...segment,
    start: millisecondsToTimeOfDay(roundDownToMultiple(timeOfDayToMilliseconds(segment.start), HOUR_MILLISECONDS)),
    end: millisecondsToTimeOfDay(roundUpToMultiple(timeOfDayToMilliseconds(segment.end), HOUR_MILLISECONDS))
  }
}

export function snapTimeFilterToInterval(timeFilter: TimeFilter, interval: QueryInterval): TimeFilter {
  switch (interval) {
    case QueryInterval.ONE_DAY:
    case QueryInterval.ONE_WEEK:
      return timeFilter;
    case QueryInterval.ONE_HOUR:
      return timeFilter.map(segment => snapTimeFilterSegmentToHour(segment));
    case QueryInterval.FIVE_MINUTES:
      return timeFilter.map(segment => snapTimeFilterSegmentToMinutes(segment, 5));
    case QueryInterval.FIFTEEN_MINUTES:
      return timeFilter.map(segment => snapTimeFilterSegmentToMinutes(segment, 15));
  }
}
