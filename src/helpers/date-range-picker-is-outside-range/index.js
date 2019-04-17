import moment from 'moment';

// The maximum number of days in the past that can be selected by the date range picker
export const MAXIMUM_DAY_LENGTH = 3 * 31; // Three months of data

// Given a day on the calendar and the current day, determine if the square on the calendar should
// be grayed out or not.
export default function isOutsideRange(localDay) {
  const day = moment.utc(localDay);
  const now = moment.utc();

  // If a startDate is selected, then permit the next MAXIMUM_DAY_LENGTH days to be selectable
  const rangeStart = now.clone().subtract(MAXIMUM_DAY_LENGTH-1, 'days');
  const rangeEnd = now.clone().subtract(1, 'day');
  const isWithinRange = (
    day.isAfter(rangeStart, 'day') && day.isSameOrBefore(rangeEnd, 'day')
  );
  return !isWithinRange;
}
