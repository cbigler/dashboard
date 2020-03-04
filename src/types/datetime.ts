import { DayOfWeek } from '@density/lib-api-types/core-v2/common';

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