import moment from 'moment';

// If no time segment group is selected or defined, default to using this one.
export const DEFAULT_TIME_SEGMENT_GROUP = {
  id: 'tsg_default',
  name: 'Whole Day',
  timeSegments: [
    {
      id: 'tsm_default',
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
    },
  ],
};
export const DEFAULT_TIME_SEGMENT = DEFAULT_TIME_SEGMENT_GROUP.timeSegments[0];
export const DEFAULT_TIME_SEGMENT_LABEL = DEFAULT_TIME_SEGMENT_GROUP.name;

export function findTimeSegmentsForTimeSegmentLabel(timeSegmentLabel, space) {
  if (timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL) {
    return space.timeSegments;
  } else {
    return space.timeSegments.filter(ts => ts.label === timeSegmentLabel);
  }
}

export function getAllTimeSegmentLabelsForSpace(space) {
  const allLabels = space.timeSegments.map(t => t.label);
  return Array.from(new Set(allLabels));
}

// Moment only supports parsing dates. So, in order to support handling time ranges, we need to
// write a bit of custom parsing logic for the times returned from the core api.
//
// This code might blow up on leap years or something like that where the length of a day slightly
// changes (since we're using a hard-coded initial start date value.)
const TIME_SEGMENT_REGEX = /^([0-9]+):([0-9]+):([0-9]+)$/;
export function parseTimeInTimeSegmentToSeconds(value) {
  const match = TIME_SEGMENT_REGEX.exec(value);
  if (match) {
    const now = moment.utc('2014-05-07T00:00:00Z' /* density epoch */).startOf('day');
    const withTime = now.clone()
      .add(match[1], 'hours')
      .add(match[2], 'minutes')
      .add(match[3], 'seconds');
    return withTime.diff(now, 'seconds');
  } else {
    return null;
  }
}

// Parse both the start and end time from a time segment using the above function
// Throw an error if the time segment does not have a valid start or end
export function parseStartAndEndTimesInTimeSegment(timeSegment) {
  const startSeconds = parseTimeInTimeSegmentToSeconds(timeSegment.start);
  const endSeconds = parseTimeInTimeSegmentToSeconds(timeSegment.end);
  if (startSeconds === null || endSeconds === null) {
    throw Error('Utilization time segment must exist!')
  }
  return { startSeconds, endSeconds };
}
