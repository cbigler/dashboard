export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

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