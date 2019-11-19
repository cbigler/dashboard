import { mod } from '../math';
import { TimeOfDay } from '../../types/datetime';


// The time portion of an ISO timestamp (seconds and milliseconds optional)
// eg. 12:34 | 12:34:56 | 12:34:56.789
const TIME_STRING_REGEXP = /^(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{3}))?$/;

export function parseTimeString(timeString: string): TimeOfDay | null {
  const result = TIME_STRING_REGEXP.exec(timeString);
  if (result === null) {
    return null;
  }
  const [, hourString, minuteString, secondString, millisecondString] = result;
  const hour = parseInt(hourString, 10) || 0;
  const minute = parseInt(minuteString, 10) || 0;
  const second = parseInt(secondString, 10) || 0;
  const millisecond = parseInt(millisecondString, 10) || 0;
  return {
    hour,
    minute,
    second,
    millisecond,
  }
}

export const SECOND_MILLISECONDS = 1000;
export const MINUTE_MILLISECONDS = 60 * SECOND_MILLISECONDS;
export const HOUR_MILLISECONDS = 60 * MINUTE_MILLISECONDS;
export const DAY_MILLISECONDS = 24 * HOUR_MILLISECONDS;

export function timeOfDayToMilliseconds(timeOfDay: TimeOfDay) {
  const fromHours = timeOfDay.hour * HOUR_MILLISECONDS;
  const fromMinutes = timeOfDay.minute * MINUTE_MILLISECONDS;
  const fromSeconds = (timeOfDay.second || 0) * SECOND_MILLISECONDS;
  const fromMilliseconds = timeOfDay.millisecond || 0;
  return fromHours + fromMinutes + fromSeconds + fromMilliseconds;
}

export function millisecondsToTimeOfDay(milliseconds: number) {
  const output: TimeOfDay = {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }

  // special case, exactly 24 hours
  if (milliseconds === DAY_MILLISECONDS) {
    return { hour: 24, minute: 0, second: 0, millisecond: 0 };
  }

  // otherwise, normalize modulo full day
  let normalized = mod(milliseconds, DAY_MILLISECONDS);

  while (normalized >= HOUR_MILLISECONDS) {
    normalized -= HOUR_MILLISECONDS;
    output.hour += 1;
  }
  while (normalized >= MINUTE_MILLISECONDS) {
    normalized -= MINUTE_MILLISECONDS;
    output.minute += 1
  }
  while (normalized >= SECOND_MILLISECONDS) {
    normalized -= SECOND_MILLISECONDS;
    output.second += 1;
  }
  while (normalized > 0) {
    normalized -= 1;
    output.millisecond += 1
  }
  return output;
}

export function timeOfDayAsPortionOfFullDay(timeOfDay: TimeOfDay) {
  return timeOfDayToMilliseconds(timeOfDay) / DAY_MILLISECONDS;
}
