import fetchAllPages from '../../../../helpers/fetch-all-pages/index';
import objectSnakeToCamel from '../../../../helpers/object-snake-to-camel/index';
import {
  formatInISOTimeAtSpace,
  parseISOTimeAtSpace,
} from '../../../../helpers/space-time-utilities/index';
import { core } from '../../../../client';

import { convertTimeRangeToDaysAgo } from './helpers';

const VALUE_EXTRACTORS = {
  VISITS_PER_MINUTE: bucket => Math.ceil(bucket.interval.analytics.entrances / 5),
  VISITS_PER_HOUR: bucket => bucket.interval.analytics.entrances,
  OCCUPANCY: bucket => bucket.interval.analytics.max,
};

const BUCKET_LENGTHS = {
  VISITS_PER_MINUTE: 300,
  VISITS_PER_HOUR: 3600,
  OCCUPANCY: 300
}

export default async function dailyPeaks(report) {
  const metric = report.settings.metric || 'VISITS_PER_MINUTE';

  const space: any = objectSnakeToCamel(await core.spaces.get({ id: report.settings.spaceId }));
  const timeSegmentGroup: any = objectSnakeToCamel(await core.time_segment_groups.get({ id: report.settings.timeSegmentGroupId }));
  const timeRange = convertTimeRangeToDaysAgo(space, report.settings.timeRange);

  // Find the time segment group and applicable time segment for this space.
  const timeSegmentGroupIds = timeSegmentGroup.timeSegments.map(j => j.timeSegmentId);
  const timeSegment = space.timeSegments.find(i => timeSegmentGroupIds.indexOf(i.id) >= 0);
  if (!timeSegment) {
    throw new Error('Cannot find applicable time segment for time segment group');
  }

  // Fetch the count with the spaces/:id/counts endpoint with an interval of 5 minutes,
  // including the relevant start_time, end_time, and time segment group.
  const buckets = await fetchAllPages(page => {
    return core.spaces.counts({
      id: report.settings.spaceId,
      interval: `${BUCKET_LENGTHS[metric]}s`,
      start_time: formatInISOTimeAtSpace(timeRange.start, space),
      end_time: formatInISOTimeAtSpace(timeRange.end, space),
      time_segment_groups: report.settings.timeSegmentGroupId,
      page,
      page_size: 5000,
    });
  });

  // Group together all counts fetched into buckets for each day.
  const bucketsByDay = {}
  buckets.forEach(bucket => {
    const bucketValue = VALUE_EXTRACTORS[metric](bucket);
    const localTime = parseISOTimeAtSpace(bucket.timestamp, space);
    const day = localTime.clone().format('YYYY-MM-DD');
    if (bucketsByDay[day]) {
      if (localTime < bucketsByDay[day].start) {
        bucketsByDay[day].start = localTime;
      }
      if (localTime.clone().add(BUCKET_LENGTHS[metric], 'seconds') > bucketsByDay[day].end) {
        bucketsByDay[day].end = localTime.clone().add(BUCKET_LENGTHS[metric], 'seconds');
      }
      if (bucketValue > bucketsByDay[day].maxBucket.value) {
        bucketsByDay[day].maxBucket = {value: bucketValue, timestamp: localTime};
      }
      bucketsByDay[day].data.push({
        timestamp: localTime,
        value: bucketValue
      });
    } else {
      bucketsByDay[day] = {
        start: localTime,
        end: localTime.clone().add(BUCKET_LENGTHS[metric], 'seconds'),
        maxBucket: {value: bucketValue, timestamp: localTime},
        data: [{
          timestamp: localTime,
          value: bucketValue
        }]
      };
    };
  });

  const data: any[] = Object.values(bucketsByDay);
  data.forEach(day => {
    if (day.data.length > 0) {
      const lastBucket = day.data[day.data.length - 1];
      day.data.push({
        timestamp: lastBucket.timestamp.clone().add(BUCKET_LENGTHS[metric], 'seconds'),
        value: lastBucket.value
      });
    }
  });

  return {
    title: report.name,
    startDate: timeRange.start,
    endDate: timeRange.end,
    spaces: [space.name],
    data,

    metric: metric,
    curveType: report.settings.curveType,
    numberOfBands: report.settings.numberOfBands,
  };
}
