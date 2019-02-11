import assert from 'assert';
import {
  DEFAULT_TIME_SEGMENT_GROUP,
  DEFAULT_TIME_SEGMENT,
  findTimeSegmentsInTimeSegmentGroupForSpace,
  parseTimeInTimeSegmentToSeconds,
} from './index';

const TIME_SEGMENT_IN_GROUP = {
  id: 'tsm_ingroup',
  name: 'Whole Day',
  start: '00:00:00',
  end: '23:59:59',
  days: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
};
const TIME_SEGMENT_GROUP = {
  id: 'tsg_one',
  name: 'Group One',
  timeSegments: [ {timeSegmentId: TIME_SEGMENT_IN_GROUP.id, name: TIME_SEGMENT_IN_GROUP.name} ],
};

const SECONDS_PER_DAY = 86400;

describe('time-segments', function() {
  describe('findTimeSegmentsInTimeSegmentGroupForSpace', () => {
    it('should find the time segment when given the group and a space that contains the given time segment', () => {
      const SPACE = {
        id: 'spc_myspace',
        name: 'My Space',
        timeSegmentGroups: [ TIME_SEGMENT_GROUP ],
        timeSegments: [ TIME_SEGMENT_IN_GROUP ],
      };
      const result = findTimeSegmentsInTimeSegmentGroupForSpace(TIME_SEGMENT_GROUP, SPACE);
      assert.deepEqual(result, [TIME_SEGMENT_IN_GROUP]);
    });
    it('should throw an error if no time segment in the space and the time segment group can be found', () => {
      const SPACE = {
        id: 'spc_myspace',
        name: 'My Space',
        timeSegmentGroups: [],
        timeSegments: [],
      };
      assert.throws(() => {
        findTimeSegmentsInTimeSegmentGroupForSpace(TIME_SEGMENT_GROUP, SPACE);
      }, new Error(`This space doesn't have an applicable time segment within the selected time segment group.`));
    });
    it('should always be able to find the default time segment in any space', () => {
      const SPACE = {
        id: 'spc_myspace',
        name: 'My Space',
        timeSegmentGroups: [],
        timeSegments: [],
      };
      const result = findTimeSegmentsInTimeSegmentGroupForSpace(DEFAULT_TIME_SEGMENT_GROUP, SPACE);
      assert.deepEqual(result, [DEFAULT_TIME_SEGMENT]);
    });
  });
  describe('parseTimeInTimeSegmentToSeconds', () => {
    it('should parse a variety of times', () => {
      assert.equal(parseTimeInTimeSegmentToSeconds('12:00:00'), SECONDS_PER_DAY / 2);
      assert.equal(parseTimeInTimeSegmentToSeconds('6:00:00'), SECONDS_PER_DAY / 4);
      assert.equal(parseTimeInTimeSegmentToSeconds('06:00:00'), SECONDS_PER_DAY / 4);
      assert.equal(parseTimeInTimeSegmentToSeconds('6:30:00'), SECONDS_PER_DAY * (6.5/24));
      assert.equal(parseTimeInTimeSegmentToSeconds('19:00:00'), SECONDS_PER_DAY * (19/24));
      assert.equal(parseTimeInTimeSegmentToSeconds('18:30:00'), SECONDS_PER_DAY * (18.5/24));
      assert.equal(parseTimeInTimeSegmentToSeconds('23:59:59'), SECONDS_PER_DAY-1);
      assert.equal(parseTimeInTimeSegmentToSeconds('00:00:00'), 0);
    });
    it('should not parse an invalid time', () => {
      assert.equal(parseTimeInTimeSegmentToSeconds('invalid'), null);
      assert.equal(parseTimeInTimeSegmentToSeconds('abc:def:ghi'), null);
    });
  });
});

