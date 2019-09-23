import moment, { Moment, Duration } from 'moment';

import { AnalyticsDatapoint, QueryInterval, AnalyticsFocusedMetric } from '../../types/analytics';
import { BoxPadding } from '../../types/geometry';

import { Bucket, HoverStateValid } from './types';


export const midpoint = (a: number, b: number) => a + ((b - a) / 2)
export const displayTimestamp = (d: AnalyticsDatapoint) => midpoint(d.startLocalEpochTime, d.endLocalEpochTime)


// REVIEW: this does not handle "weeks" or greater for QueryInterval
export const computeBuckets = (startDate: Moment, endDate: Moment, duration: Duration, datapoints: AnalyticsDatapoint[], selectedMetric: AnalyticsFocusedMetric): [Bucket[], number] => {
  
  let overallMaxMetricValue = 0;

  let m = startDate.clone();
  let buckets: Bucket[] = []
  while (m < endDate) {
    const start = m.valueOf();
    // NOTE: this also mutates `m`, so this is the line that increments it for the while loop
    const end = m.add(duration).valueOf()
    const middle = midpoint(start, end);
    buckets.push({
      start,
      end,
      middle,
      datapoints: []
    })
  }

  const datapointGroups = new Map<number, AnalyticsDatapoint[]>();

  // We're going to iterate through the collection of datapoints once...
  datapoints.forEach(datapoint => {

    // ...to find the max metric value...
    if (datapoint[selectedMetric] > overallMaxMetricValue) {
      overallMaxMetricValue = datapoint[selectedMetric]
    }

    // ...and also to group them by local start time
    let group: AnalyticsDatapoint[];
    if (datapointGroups.has(datapoint.startLocalEpochTime)) {
      group = (datapointGroups.get(datapoint.startLocalEpochTime) || [])
    } else {
      group = []
    }
    group = group.concat([datapoint])
    datapointGroups.set(datapoint.startLocalEpochTime, group)

  })

  // OK, now we can put each datapoint group into the appropriate bucket

  buckets = buckets.map(bucket => {
    bucket.datapoints = datapointGroups.get(bucket.start) || []
    return bucket;
  })

  return [buckets, overallMaxMetricValue];
}

export const getTooltipPosition = (width: number, padding: BoxPadding, hoverState: HoverStateValid) => {
  const position = { top: 56 };
  if (hoverState.x.position > (width / 2)) {
    return {
      ...position,
      right: 16 + (width - hoverState.x.position) + padding.right
    }
  } else {
    return {
      ...position,
      left: 16 + hoverState.x.position + padding.left
    }
  }
}

/**
 * These functions are used when formatting the datetime in the tooltip popover
 */
const momentFormatStringForInterval = (interval: QueryInterval): string => {
  switch (interval) {
    // case QueryInterval.ONE_WEEK:
      // TODO
    case QueryInterval.ONE_DAY:
      return 'ddd, MMM D';
    case QueryInterval.ONE_HOUR:
      return 'ddd, MMM D, ha';
    case QueryInterval.FIFTEEN_MINUTES:
    case QueryInterval.FIVE_MINUTES:
    default:
      return 'ddd, MMM D, h:mma'

  }
}
export const formatDateLabelForTooltip = (epochMilliseconds: number, interval: QueryInterval): string => {
  return moment.utc(epochMilliseconds)
    .format(momentFormatStringForInterval(interval));
}
