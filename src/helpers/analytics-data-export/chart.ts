import moment from 'moment-timezone';
import * as d3Array from 'd3-array';
import * as d3Dsv from 'd3-dsv';
import startCase from 'lodash/startCase';

import {
  AnalyticsDatapoint,
  AnalyticsFocusedMetric,
  QueryInterval,
} from "../../types/analytics";
import { downloadFile } from '../download-file';
import formatMetricName from '../analytics-formatters/metric-name';
import { sanitizeCSVDocument } from '../csv';

type DailyDataRow = {
  'Space': string,
  'Date': string,
  [metricName: string]: string,
}

type TimestampedDataRow = {
  'Space': string,
  'Timestamp': string,
  'Local Time': string,
  [metricName: string]: string,
}

function rollupMetricValueForGroupedDatapoints(group: AnalyticsDatapoint[], selectedMetric: AnalyticsFocusedMetric): number {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
      return d3Array.max(group, d => d.max) || 0;
    case AnalyticsFocusedMetric.UTILIZATION:
      return d3Array.max(group, d => d.target_utilization) || 0;
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return d3Array.min(group, d => d.opportunity) || 0;
    case AnalyticsFocusedMetric.ENTRANCES:
      return d3Array.sum(group, d => d.entrances) || 0;
    case AnalyticsFocusedMetric.EXITS:
      return d3Array.sum(group, d => d.exits) || 0;
    case AnalyticsFocusedMetric.EVENTS:
      return d3Array.sum(group, d => d.events) || 0;
    default:
      return 0;
  }
}

function formatMetricValue(value: number, metric: AnalyticsFocusedMetric): string {
  const suffix = metric === AnalyticsFocusedMetric.UTILIZATION ? '%' : '';
  return `${Math.round(value)}${suffix}`;
}

function getRowsForDailyInterval(datapoints: AnalyticsDatapoint[], selectedMetric: AnalyticsFocusedMetric): DailyDataRow[] {
  
  const mapping: Map<string, Map<string, AnalyticsDatapoint[]>> = (d3Array.group as Function)(datapoints,
    (d: AnalyticsDatapoint) => d.space_id,
    (d: AnalyticsDatapoint) => d.localBucketDay,
  );
  const rows: DailyDataRow[] = [];
  const metricColumnName = selectedMetric === AnalyticsFocusedMetric.MAX ? 'Occupancy' : selectedMetric === AnalyticsFocusedMetric.OPPORTUNITY ? 'Available Capacity' : startCase(selectedMetric);
  mapping.forEach((groupedByDay, space_id) => {
    groupedByDay.forEach((group, date) => {
      rows.push({
        'Date': date,
        'Space': group[0].space_name,
        [metricColumnName]: formatMetricValue(rollupMetricValueForGroupedDatapoints(group, selectedMetric), selectedMetric)
      })
    })
  });
  return rows;
}

function getRowsForNonDailyInterval(datapoints: AnalyticsDatapoint[], selectedMetric: AnalyticsFocusedMetric): TimestampedDataRow[] {
  const mapping: Map<string, Map<string, Map<string, AnalyticsDatapoint[]>>> = (d3Array.group as Function)(datapoints,
    (d: AnalyticsDatapoint) => d.space_id,
    (d: AnalyticsDatapoint) => d.localBucketDay,
    (d: AnalyticsDatapoint) => d.localBucketTime,
  )
  const rows: TimestampedDataRow[] = [];
  const metricColumnName = selectedMetric === AnalyticsFocusedMetric.MAX ? 'Occupancy' : selectedMetric === AnalyticsFocusedMetric.OPPORTUNITY ? 'Available Capacity' : startCase(selectedMetric);
  mapping.forEach((groupedByDate) => {
    groupedByDate.forEach((groupedByTime) => {
      groupedByTime.forEach((group) => {
        rows.push({
          'Space': group[0].space_name,
          'Timestamp': moment.tz(group[0].millisecondsSinceUnixEpoch, group[0].time_zone).format(),
          'Local Time': `${group[0].localDay} ${group[0].localTime}:00`,
          [metricColumnName]: formatMetricValue(rollupMetricValueForGroupedDatapoints(group, selectedMetric), selectedMetric)
        })
      })
    })
  })
  return rows;
}

export function exportAnalyticsChartData(inputDatapoints: AnalyticsDatapoint[], interval: QueryInterval, selectedMetric: AnalyticsFocusedMetric, hiddenSpaceIds: string[]) {

  // rows that are toggled off are not included in export
  const datapoints = inputDatapoints.filter(d => !hiddenSpaceIds.includes(d.space_id))

  const [startDate, endDate] = d3Array.extent(datapoints, d => d.localDay);
  const metricColumnName = formatMetricName(selectedMetric);

  const fileName = `density_time-series_${interval}_${metricColumnName.replace(' ', '_').toLowerCase()}_${startDate}_${endDate}.csv`;

  let csvData: string;

 
  if (interval === QueryInterval.ONE_DAY) {
    const rows = getRowsForDailyInterval(datapoints, selectedMetric);
    csvData = d3Dsv.csvFormat(rows, ['Space', 'Date', metricColumnName])
  } else {
    const rows = getRowsForNonDailyInterval(datapoints, selectedMetric);
    csvData = d3Dsv.csvFormat(rows, ['Space', 'Timestamp', 'Local Time', metricColumnName])
  }

  const sanitizedData = sanitizeCSVDocument(csvData)
  downloadFile(fileName, sanitizedData, 'text/csv;charset=utf8;');
}