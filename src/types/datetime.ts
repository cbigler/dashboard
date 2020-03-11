import { DayOfWeek } from '@density/lib-common-types';

export type TimeOfDay = {
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
}

export type TimeFilter = Array<{
  start: TimeOfDay,
  end: TimeOfDay,
  days: DayOfWeek[]
}>
