import moment from 'moment';
import bankersRound from '../../../../helpers/bankers-round/index';
import fetchAllPages from '../../../../helpers/fetch-all-pages/index';
import objectSnakeToCamel from '../../../../helpers/object-snake-to-camel/index';
import {
  formatInISOTimeAtSpace,
  parseISOTimeAtSpace,
} from '../../../../helpers/space-time-utilities/index';
import { core } from '../../../../client';

import { convertTimeRangeToDaysAgo } from './helpers';
import { ReportHourlyBreakdownProps } from '@density/ui-report-hourly-breakdown';

export default async function hourlyBreakdown(report): Promise<ReportHourlyBreakdownProps> {
  const space: any = objectSnakeToCamel(await core.spaces.get({ id: report.settings.spaceId }));
  const timeRange = convertTimeRangeToDaysAgo(space, report.settings.timeRange);

  // Fetch all count data within the time range, specifying an interval of 1 hour
  let data = await fetchAllPages(page => {
    return core.spaces.counts({
      id: report.settings.spaceId,
      interval: '1h',
      start_time: formatInISOTimeAtSpace(timeRange.start, space),
      end_time: formatInISOTimeAtSpace(timeRange.end, space),
      page,
      page_size: 5000,
    });
  });

  // If the include weekends flag is enabled, then filter out all buckets that occur on weekends.
  if (!report.settings.includeWeekends) {
    data = data.filter(bucket => {
      const timestamp = parseISOTimeAtSpace(bucket.timestamp, space);
      const dayOfWeek = timestamp.format('dddd');
      const isWeekend = ['Saturday', 'Sunday'].indexOf(dayOfWeek) >= 0;
      return !isWeekend;
    });
  }

  // Group together all count buckets, one group per (columnKey + hours)
  // Aggregate all buckets in each (columnKey + hours) into a "bucketArray"
  const bucketsByColumn: any[] = [];
  data.sort((a, b) => moment.utc(a.timestamp).diff(moment.utc(b.timestamp))).forEach(bucket => {

    // Determine values for the unique columnKey and its index in the grouped array, if it exists yet
    const bucketTimestamp = parseISOTimeAtSpace(bucket.timestamp, space);
    const bucketDate = bucketTimestamp.format('YYYY-MM-DD');
    const columnKey = (report.settings.aggregation || 'NONE') === 'NONE' ?
      bucketDate : bucketTimestamp.format('dddd');
    const columnIndex = bucketsByColumn.findIndex(d => d.columnKey === columnKey);

    // If column is found, append each bucket to the correct "bucketArray" for its time slot
    if (columnIndex >= 0) {

      // Determine value of the row index for this bucket
      const columnBucketArrays = bucketsByColumn[columnIndex].bucketArrays;
      const columnTimestamp = parseISOTimeAtSpace(columnBucketArrays[0][0].timestamp, space);
      const columnStartTime = moment.utc(columnTimestamp.format('HH:mm'), 'HH:mm');
      const rowStartTime = moment.utc(bucketTimestamp.format('HH:mm'), 'HH:mm');
      const rowIndex = rowStartTime.diff(columnStartTime, 'hours');

      // If bucketArray at this row index exists, append the value, otherwise create a new bucketArray
      if (bucketsByColumn[columnIndex].bucketArrays[rowIndex]) {
        bucketsByColumn[columnIndex].bucketArrays[rowIndex].push(bucket);
      } else {
        bucketsByColumn[columnIndex].bucketArrays[rowIndex] = [bucket];
      }

      // Overwrite the date since it's OK if the columns end up with the "latest" date for each weekday
      bucketsByColumn[columnIndex].date = bucketDate;

    // If the column is not found, create it and include the first bucket
    } else {
      bucketsByColumn.push({
        columnKey,
        bucketDate,
        bucketArrays: [[bucket]]
      });
    }
  });

  // Determine the "extractor" function to get the correct metric out of each bucket
  let valueExtractor: (any) => any;
  if (report.settings.metric === 'PEAKS') {
    valueExtractor = i => i.interval.analytics.max
  } else {
    valueExtractor = i => i.interval.analytics.entrances
  }

  // Aggregate the buckets for each day/time if necessary, and map to an array of values
  const dataByColumn = bucketsByColumn.map(({date, bucketArrays}) => {
    return {
      date: moment.tz(date, "YYYY-MM-DD", space.timeZone),
      values: bucketArrays.map(bucketArray => {
        let value;
        // Sum the values in each bucketArray
        if (report.settings.aggregation === 'SUM') {
          value = bucketArray.reduce((acc, i) => acc + valueExtractor(i), 0);
        // Average the values in each bucketArray
        } else if (report.settings.aggregation === 'AVERAGE') {
          value = bucketArray.reduce((acc, i) => acc + valueExtractor(i), 0);
          value = value / bucketArray.length;
          value = value >= 100 ? bankersRound(value, 0) : bankersRound(value, 1);
        // Don't aggregate by default, there should be only one bucket in each bucketArray
        } else {
          value = valueExtractor(bucketArray[0]);
        }
        return value;
      })
    };
  });

  return {
    title: report.name,
    startDate: timeRange.start,
    endDate: timeRange.end,
    space,

    data: dataByColumn,
    metric: report.settings.metric,
    aggregation: report.settings.aggregation
  };
}
