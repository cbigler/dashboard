import moment from 'moment';
import assert from 'assert';
import { splitTimeRangeIntoSubrangesWithSameOffset } from './index';

const NYC_SPACE = { name: 'New York Space', timeZone: 'America/New_York' };
const LA_SPACE = { name: 'Los Angeles Space', timeZone: 'America/Los_Angeles' };
const CALCUTTA_SPACE = { name: 'Kolkata Space', timeZone: 'Asia/Kolkata' };

function assertSubRangesEqual(subrangesA, subrangesB) {
  const a = subrangesA.map(i => ({start: i.start.toISOString(), end: i.end.toISOString(), gap: i.gap}));
  const b = subrangesB.map(i => ({start: i.start.toISOString(), end: i.end.toISOString(), gap: i.gap}));
  assert.deepEqual(a, b);
}

describe('time-conversions', function() {
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

