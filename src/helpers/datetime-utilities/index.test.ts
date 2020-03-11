import { TimeFilter } from '../../types/datetime';
import { serializeTimeFilter } from '.';
import { DayOfWeek } from '@density/lib-common-types';

describe('serializeTimeFilter', () => {
  test('basic functionality', () => {
    const weekdays: TimeFilter[0] = {
      start: { hour: 9, minute: 30, second: 0, millisecond: 0 },
      end: { hour: 18, minute: 30, second: 0, millisecond: 0 },
      days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]
    }
    const weekends: TimeFilter[0] = {
      start: { hour: 11, minute: 0, second: 0, millisecond: 0 },
      end: { hour: 16, minute: 0, second: 0, millisecond: 0 },
      days: [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]
    }
    const result = serializeTimeFilter([weekdays, weekends]);
    expect(result).toBe('Mon+Tue+Wed+Thu+Fri:0930-1830,Sat+Sun:1100-1600')
  })
})
