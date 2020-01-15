import moment from 'moment';
import assert from 'assert';
import {
  DATE_RANGES,
  realizeDateRange,
  realizeRelativeDuration,
  RangeType,
  splitTimeRangeIntoSubrangesWithSameOffset,
} from './index';
import { DayOfWeek } from '../../types/datetime';

const NYC_SPACE = { name: 'New York Space', time_zone: 'America/New_York' };
const LA_SPACE = { name: 'Los Angeles Space', time_zone: 'America/Los_Angeles' };
const CALCUTTA_SPACE = { name: 'Kolkata Space', time_zone: 'Asia/Kolkata' };

function assertSubRangesEqual(subrangesA, subrangesB) {
  const a = subrangesA.map(i => ({start: i.start.toISOString(), end: i.end.toISOString(), gap: i.gap}));
  const b = subrangesB.map(i => ({start: i.start.toISOString(), end: i.end.toISOString(), gap: i.gap}));
  assert.deepEqual(a, b);
}

describe('time-conversions', function() {
  describe('realizeDateRange', () => {
    it('should realize absolute date ranges', () => {
      const {startDate, endDate} = realizeDateRange({
        type: RangeType.ABSOLUTE,
        startDate: '2019-01-01',
        endDate: '2019-02-01',
      }, 'America/Los_Angeles');
      assert.equal(startDate.format(), '2019-01-01T00:00:00-08:00');
      assert.equal(endDate.format(), '2019-02-01T23:59:59-08:00');
    });
    it('should realize a relative date range in la', () => {
      const now = moment.tz('2019-03-15T10:00:00', 'America/Los_Angeles');
      const {startDate, endDate} = realizeDateRange(DATE_RANGES.LAST_WEEK, 'America/Los_Angeles', { now });
      assert.equal(startDate.format(), '2019-03-03T00:00:00-08:00');
      assert.equal(endDate.format(), '2019-03-09T23:59:59-08:00');
    });
    it('should realize a relative date range in ny', () => {
      const now = moment.tz('2019-03-15T10:00:00', 'America/New_York');
      const {startDate, endDate} = realizeDateRange(DATE_RANGES.LAST_WEEK, 'America/New_York', { now });
      assert.equal(startDate.format(), '2019-03-03T00:00:00-05:00');
      assert.equal(endDate.format(), '2019-03-09T23:59:59-05:00');
    });
    it('should realize a relative date range with a non-standard week start day', () => {
      const now = moment.tz('2019-03-15T10:00:00', 'America/Los_Angeles');
      const {startDate, endDate} = realizeDateRange(DATE_RANGES.LAST_WEEK, 'America/Los_Angeles', {
        now,
        organizationalWeekStartDay: 'Wednesday',
      });
      assert.equal(startDate.format(), '2019-03-06T00:00:00-08:00');
      assert.equal(endDate.format(), '2019-03-12T23:59:59-07:00');
    });
  });
  describe('splitTimeRangeIntoSubrangesWithSameOffset', () => {
    describe('in new york', () => {
      it('no daylight savings', () => {
        const start = '2018-11-12T00:00:00Z';
        const end = '2018-11-13T00:00:00Z';
        const interval = '1h';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-12T00:00:00.000+00:00"),
            end: moment.utc("2018-11-13T00:00:00.000+00:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary', () => {
        const start = '2018-10-01T00:00:00.000-04:00';
        const end = '2018-12-01T00:00:00.000-05:00';
        const interval = '1h';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-10-01T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T02:00:00.000-04:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T01:00:00.000-05:00"),
            end: moment.utc("2018-12-01T00:00:00.000-05:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary and day-long intervals', () => {
        const start = '2018-10-01T00:00:00.000-04:00';
        const end = '2018-12-01T00:00:00.000-05:00';
        const interval = '1d';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-10-01T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T02:00:00.000-04:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T02:00:00.000-04:00"),
            end: moment.utc("2018-11-05T00:00:00.000-05:00"),
            gap: true
          },
          {
            start: moment.utc("2018-11-05T00:00:00.000-05:00"),
            end: moment.utc("2018-12-01T00:00:00.000-05:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary between intervals', () => {
        const start = '2018-11-04T00:00:00.000-04:00';
        const end = '2018-11-04T10:00:00.000-05:00';
        const interval = '17m';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-04T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T02:00:00.000-04:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T02:00:00.000-04:00"),
            end: moment.utc("2018-11-04T01:16:00.000-05:00"), // 16-MINUTE GAP
            gap: true
          },
          {
            start: moment.utc("2018-11-04T01:16:00.000-05:00"),
            end: moment.utc("2018-11-04T10:00:00.000-05:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary and descending order', () => {
        const start = '2018-10-01T00:00:00.000-04:00';
        const end = '2018-12-01T00:00:00.000-05:00';
        const interval = '1h';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval, order: 'desc' },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-04T01:00:00.000-05:00"),
            end: moment.utc("2018-12-01T00:00:00.000-05:00"),
            gap: false
          },
          {
            start: moment.utc("2018-10-01T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T02:00:00.000-04:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary and day-long intervals, in descending order', () => {
        const start = '2018-10-01T00:00:00.000-04:00';
        const end = '2018-12-01T00:00:00.000-05:00';
        const interval = '1d';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval, order: 'desc' }
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-04T01:00:00.000-05:00"),
            end: moment.utc("2018-12-01T00:00:00.000-05:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T01:00:00.000-05:00"),
            gap: true
          },
          {
            start: moment.utc("2018-10-01T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T00:00:00.000-04:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary between intervals, in descending order', () => {
        const start = '2018-11-04T00:00:00.000-04:00';
        const end = '2018-11-04T10:00:00.000-05:00';
        const interval = '17m';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          NYC_SPACE,
          start,
          end,
          { interval, order: 'desc' }
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-04T01:00:00.000-05:00"),
            end: moment.utc("2018-11-04T10:00:00.000-05:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T01:56:00.000-04:00"),
            end: moment.utc("2018-11-04T01:00:00.000-05:00"), // 4-MINUTE GAP
            gap: true
          },
          {
            start: moment.utc("2018-11-04T00:00:00.000-04:00"),
            end: moment.utc("2018-11-04T01:56:00.000-04:00"),
            gap: false
          },
        ]);
      });
    });
    describe('in los angeles', () => {
      it('no daylight savings', () => {
        const start = '2018-11-12T00:00:00.000Z';
        const end = '2018-11-13T00:00:00.000Z';
        const interval = '1h';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          LA_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-11-12T00:00:00.000+00:00"),
            end: moment.utc("2018-11-13T00:00:00.000+00:00"),
            gap: false
          },
        ]);
      });
      it('with daylight savings boundary', () => {
        const start = '2018-10-01T00:00:00.000-07:00';
        const end = '2018-12-01T00:00:00.000-08:00';
        const interval = '1h';
        const subranges = splitTimeRangeIntoSubrangesWithSameOffset(
          LA_SPACE,
          start,
          end,
          { interval },
        );

        assertSubRangesEqual(subranges, [
          {
            start: moment.utc("2018-10-01T00:00:00.000-07:00"),
            end: moment.utc("2018-11-04T02:00:00.000-07:00"),
            gap: false
          },
          {
            start: moment.utc("2018-11-04T01:00:00.000-08:00"),
            end: moment.utc("2018-12-01T00:00:00.000-08:00"),
            gap: false
          },
        ]);
      });
    });
  });
});

describe('Realization of relative ranges, with now being Friday 9/20/2019', () => {

  const tz = 'America/Chicago';
  const now = moment.tz('2019-09-20T20:33:57', tz);
  const organizationalWeekStartDay = 'Sunday';

  expect(now.format('dddd')).toBe('Friday');
  expect(now.hour()).toBe(20)
  expect(now.minute()).toBe(33)
  expect(now.second()).toBe(57)

  describe('WEEK_TO_DATE', () => {
    
    const { startDate, endDate } = realizeDateRange(DATE_RANGES.WEEK_TO_DATE, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at midnight on the previous organizationalWeekStartDay', () => { 
      expect(startDate.format('dddd')).toBe('Sunday')
      expect(startDate.date()).toBe(15)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight tonight, eg. 23:59:59.999', () => {
      expect(endDate.format('dddd')).toBe('Friday')
      expect(endDate.date()).toBe(20)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

  describe('LAST_7_DAYS', () => {
    
    const { startDate, endDate } = realizeDateRange(DATE_RANGES.LAST_7_DAYS, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at midnight 7 days before 00:00:00 today', () => {
      expect(startDate.format('dddd')).toBe('Friday')
      expect(startDate.date()).toBe(13)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight tonight, eg. 23:59:59.999', () => {
      expect(endDate.format('dddd')).toBe('Friday')
      expect(endDate.date()).toBe(20)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

  describe('LAST_WEEK', () => {

    const { startDate, endDate } = realizeDateRange(DATE_RANGES.LAST_WEEK, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at the 2nd organizationalWeekStartDay midnight backward from now', () => {
      expect(startDate.format('dddd')).toBe('Sunday')
      expect(startDate.date()).toBe(8)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight on the previous day before organizationalWeekStartDay', () => {
      expect(endDate.format('dddd')).toBe('Saturday')
      expect(endDate.date()).toBe(14)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

})

describe('Realization of relative ranges, with now being Monday 9/23/2019 and weeks starting Wednesday', () => {

  const tz = 'America/New_York';
  const now = moment.tz('2019-09-23T13:48:31', tz);
  const organizationalWeekStartDay = 'Wednesday';

  expect(now.format('dddd')).toBe('Monday');
  expect(now.date()).toBe(23)
  expect(now.hour()).toBe(13)
  expect(now.minute()).toBe(48)
  expect(now.second()).toBe(31)

  describe('WEEK_TO_DATE', () => {

    const { startDate, endDate } = realizeDateRange(DATE_RANGES.WEEK_TO_DATE, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at midnight on the previous organizationalWeekStartDay', () => {
      expect(startDate.format('dddd')).toBe('Wednesday')
      expect(startDate.date()).toBe(18)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight tonight, eg. 23:59:59.999', () => {
      expect(endDate.format('dddd')).toBe('Monday')
      expect(endDate.date()).toBe(23)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

  describe('LAST_7_DAYS', () => {

    const { startDate, endDate } = realizeDateRange(DATE_RANGES.LAST_7_DAYS, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at midnight 7 days before 00:00:00 today', () => {
      expect(startDate.format('dddd')).toBe('Monday')
      expect(startDate.date()).toBe(16)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight tonight, eg. 23:59:59.999', () => {
      expect(endDate.format('dddd')).toBe('Monday')
      expect(endDate.date()).toBe(23)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

  describe('LAST_WEEK', () => {

    const { startDate, endDate } = realizeDateRange(DATE_RANGES.LAST_WEEK, tz, {
      organizationalWeekStartDay,
      now
    });

    it('Should start at the 2nd organizationalWeekStartDay midnight backward from now', () => {
      expect(startDate.format('dddd')).toBe('Wednesday')
      expect(startDate.date()).toBe(11)
      expect(startDate.hour()).toBe(0)
      expect(startDate.minute()).toBe(0)
      expect(startDate.second()).toBe(0)
      expect(startDate.millisecond()).toBe(0)
    })

    it('Should end just before midnight on the previous day before organizationalWeekStartDay', () => {
      expect(endDate.format('dddd')).toBe('Tuesday')
      expect(endDate.date()).toBe(17)
      expect(endDate.hour()).toBe(23)
      expect(endDate.minute()).toBe(59)
      expect(endDate.second()).toBe(59)
      expect(endDate.millisecond()).toBe(999)
    })
  })

})

describe('realization of relative durations', () => {
  // testing a weird case for RoundedCo
  const organizationalWeekStartDay: DayOfWeek = 'Wednesday';
  const now = moment.tz('2019-09-23T14:17:45', 'America/New_York');

  test('realizing the start of the current org week', () => {
    const realized = realizeRelativeDuration(DATE_RANGES.WEEK_TO_DATE.start, now, organizationalWeekStartDay);
    // Expecting Wednesday 9/18/2019
    expect(realized.format('dddd')).toBe('Wednesday')
    expect(realized.date()).toBe(18)
  })

})