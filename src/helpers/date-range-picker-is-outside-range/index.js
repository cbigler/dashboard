import { getCurrentLocalTimeAtSpace } from '../space-time-utilities/index';

// The maximum number of days in the past that can be selected by the date range picker
export const MAXIMUM_DAY_LENGTH = 6 * 31; // Three months of data

// Given a day on the calendar and the current day, determine if the square on the calendar should
// be grayed out or not.
export default function isOutsideRange(space, localDay) {
  // The next line of code has a story to go along with it.
  //
  // Once upon a time, I was presented with a bug report saying the date picker had some weird
  // behavior and told to fix it. I did this, and pushed up a fix. However, this fix only worked on
  // spaces on the east coast of the US and not in any other time zone. After looking into this
  // further, for some reason this function was sometimes receiving moments in the time zone of the
  // space, and sometimes receiving moments in the local time zone of the user. I didn't have time
  // to investigate why, but the date portion seemed like it was right in both of them (note I
  // haven't checked any other time zones). I had to get this released for a business reason and
  // therefore couldn't put time into validating this super well. So if there's some sort of
  // timezone bug in the date picker, look here first.
  //
  // Sorry in advance :(
  const day = localDay.clone().utcOffset(space.timeZone).startOf('day');
  //                           ^- That .utcOffset method overrides the time zone on the moment (doesn't
  //                           effect the date and time part of the moment), which is different from
  //                           .tz, which adjusts the moment into a time zone and the date and time
  //                           to a new locale.
  const now = getCurrentLocalTimeAtSpace(space).startOf('day');

  // If a startDate is selected, then permit the previous MAXIMUM_DAY_LENGTH days to be selectable
  const rangeStart = now.clone().subtract(MAXIMUM_DAY_LENGTH-1, 'days');
  const rangeEnd = now.clone().subtract(1, 'day');
  const isWithinRange = (
    day.isAfter(rangeStart, 'day') && day.isSameOrBefore(rangeEnd, 'day')
  );
  return !isWithinRange;
}
