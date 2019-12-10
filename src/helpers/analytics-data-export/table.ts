import * as d3Array from 'd3-array';
import * as d3Dsv from 'd3-dsv';
import getInObject from 'lodash/get';

import { AnalyticsFocusedMetric, AnalyticsReport, ResourceStatus, TableColumn } from "../../types/analytics";
import {
  TableDataItem,
  getHighestAncestorName,
  sum,
  max,
  average,
  RowData,
  getTableColumnKeys,
  formatSpaceType,
  formatSpaceFunction,
  computeTableData,
} from '../../components/analytics-table';
import { DensitySpace } from '../../types';
import { downloadFile } from '../download-file';
import formatMetricName from '../analytics-formatters/metric-name';


function getPeakMetricValue(tableDataItem: TableDataItem, selectedMetric: AnalyticsFocusedMetric): number | null {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
      return getInObject(tableDataItem.metricData, 'count.max.value', null);
    case AnalyticsFocusedMetric.UTILIZATION:
      return getInObject(tableDataItem.metricData, 'target_utilization.max.value', null);
    case AnalyticsFocusedMetric.ENTRANCES:
      return getInObject(tableDataItem.metricData, 'entrances.peak.value', null);
    case AnalyticsFocusedMetric.EXITS:
      return getInObject(tableDataItem.metricData, 'exits.peak.value', null);
    case AnalyticsFocusedMetric.EVENTS:
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return null;
  }
}
  
function getAverageMetricValue(tableDataItem: TableDataItem, selectedMetric: AnalyticsFocusedMetric): number | null {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
      return getInObject(tableDataItem.metricData, 'count.average', null);
    case AnalyticsFocusedMetric.UTILIZATION:
      return getInObject(tableDataItem.metricData, 'target_utilization.average', null);
    case AnalyticsFocusedMetric.ENTRANCES:
      return getInObject(tableDataItem.metricData, 'entrances.average', null);
    case AnalyticsFocusedMetric.EXITS:
      return getInObject(tableDataItem.metricData, 'exits.average', null);
    case AnalyticsFocusedMetric.EVENTS:
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return null;
  }
}
  
function getTotalMetricValue(tableDataItem: TableDataItem, selectedMetric: AnalyticsFocusedMetric): number | null {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
    case AnalyticsFocusedMetric.UTILIZATION:
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return null;
    case AnalyticsFocusedMetric.ENTRANCES:
      return getInObject(tableDataItem.metricData, 'entrances.total', null);
    case AnalyticsFocusedMetric.EXITS:
      return getInObject(tableDataItem.metricData, 'exits.total', null);
    case AnalyticsFocusedMetric.EVENTS:
      return null;
  }
}
  
export function getTableValues(tableData: TableDataItem[], selectedMetric: AnalyticsFocusedMetric, opportunityCostPerPerson: number) {
  
  const withRounding = (x: number | null | undefined) => {
    if (x == null) return null;
    return Math.ceil(x);
  }

  const withMultiplier = (x: number | null | undefined, multiplier: number) => {
    if (x == null) return null;
    return x * multiplier;
  }
  
  const columnHeaders = getTableColumnKeys(selectedMetric);
  const rows: Array<RowData> = [];
  // header row (aggregations)
  const headerRow: Omit<RowData, 'spaceId'> = {
    [TableColumn.SPACE_NAME]: 'Summary',
    [TableColumn.SPACE_LOCATION]: null,
    [TableColumn.SPACE_TYPE]: null,
    [TableColumn.SPACE_FUNCTION]: null,
    [TableColumn.SPACE_CAPACITY]: sum(tableData, d => d.space.targetCapacity),
    [TableColumn.METRIC_PEAK_UTILIZATION]: average(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.UTILIZATION)),
    [TableColumn.METRIC_AVERAGE_UTILIZATION]: average(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.UTILIZATION)),
    [TableColumn.METRIC_PEAK]: max(tableData, d => getPeakMetricValue(d, selectedMetric)),
    [TableColumn.METRIC_AVERAGE]: average(tableData, d => getAverageMetricValue(d, selectedMetric)),
    [TableColumn.METRIC_TOTAL]: sum(tableData, d => getTotalMetricValue(d, selectedMetric)),
    [TableColumn.METRIC_OPPORTUNITY]: sum(tableData, d => getInObject(d.metricData, 'peakOpportunity')),
    [TableColumn.METRIC_AVERAGE_OPPORTUNITY]: withRounding(sum(tableData, d => getInObject(d.metricData, 'averageOpportunity'))),
    [TableColumn.METRIC_OPPORTUNITY_COST]: withMultiplier(sum(tableData, d => getInObject(d.metricData, 'peakOpportunity')), opportunityCostPerPerson),
    [TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST]: withMultiplier(withRounding(sum(tableData, d => getInObject(d.metricData, 'averageOpportunity'))), opportunityCostPerPerson),
    isChecked: tableData.some(d => d.isVisible),
  };
  tableData.forEach(tableDataItem => {
    rows.push({
      [TableColumn.SPACE_NAME]: tableDataItem.space.name,
      [TableColumn.SPACE_LOCATION]: getHighestAncestorName(tableDataItem.space),
      [TableColumn.SPACE_TYPE]: formatSpaceType(tableDataItem.space.spaceType),
      [TableColumn.SPACE_FUNCTION]: formatSpaceFunction(tableDataItem.space.function),
      [TableColumn.SPACE_CAPACITY]: tableDataItem.space.targetCapacity,
      [TableColumn.METRIC_PEAK_UTILIZATION]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.UTILIZATION),
      [TableColumn.METRIC_AVERAGE_UTILIZATION]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.UTILIZATION),
      [TableColumn.METRIC_PEAK]: getPeakMetricValue(tableDataItem, selectedMetric),
      [TableColumn.METRIC_AVERAGE]: getAverageMetricValue(tableDataItem, selectedMetric),
      [TableColumn.METRIC_TOTAL]: getTotalMetricValue(tableDataItem, selectedMetric),
      [TableColumn.METRIC_OPPORTUNITY]: getInObject(tableDataItem.metricData, 'peakOpportunity'),
      [TableColumn.METRIC_AVERAGE_OPPORTUNITY]: withRounding(getInObject(tableDataItem.metricData, 'averageOpportunity')),
      [TableColumn.METRIC_OPPORTUNITY_COST]: withMultiplier(getInObject(tableDataItem.metricData, 'peakOpportunity'), opportunityCostPerPerson),
      [TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST]: withMultiplier(withRounding(getInObject(tableDataItem.metricData, 'averageOpportunity')), opportunityCostPerPerson),
      isChecked: tableDataItem.isVisible,
      spaceId: tableDataItem.space.id,
    })
  })
  return {
    columnHeaders,
    headerRow,
    rows,
  }
}

export function exportAnalyticsTableData(report: AnalyticsReport, spaces: DensitySpace[]) {
  if (report.queryResult.status !== ResourceStatus.COMPLETE) return;
  const selectedSpaces: DensitySpace[] = report.queryResult.data.selectedSpaceIds
    .map(spaceId => spaces.find(s => s.id === spaceId))
    .filter(space => space != null) as DensitySpace[]
  const rawTableData = computeTableData(report, selectedSpaces, report.columnSort);

  if (rawTableData == null) return;

  const [startDate, endDate] = d3Array.extent(report.queryResult.data.datapoints, d => d.localDay);
  const metricColumnName = formatMetricName(report.selectedMetric);
  const interval = report.query.interval;

  const fileName = `density_summary_${interval}_${metricColumnName.replace(' ', '_').toLowerCase()}_${startDate}_${endDate}.csv`;

  // rows that are toggled off are not included in export
  const enabledRows = rawTableData.rows.filter(row => !report.hiddenSpaceIds.includes(row.spaceId))
  
  const inputRows = [rawTableData.headerRow].concat(enabledRows);

  const formattedRows = inputRows.map(inputRow => {
    return rawTableData.columnHeaders.reduce((row, column) => {
      const rawValue = inputRow[column];
      if (rawValue == null) {
        row[column] = null;
        return row;
      }
      switch (column) {
        case TableColumn.METRIC_PEAK:
        case TableColumn.METRIC_TOTAL:
        case TableColumn.METRIC_AVERAGE:
          row[column] = Math.ceil(Number(rawValue))
          if (report.selectedMetric === AnalyticsFocusedMetric.UTILIZATION) {
            row[column] = `${row[column]}%`;
          }
          break;
        case TableColumn.METRIC_AVERAGE_OPPORTUNITY:
          row[column] = Math.ceil(Number(rawValue));
          break;
        case TableColumn.METRIC_OPPORTUNITY_COST:
        case TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST:
          // round up to nearest dollar and prefix with dollar sign
          row[column] = `$${Math.ceil(Number(rawValue))}`;
          break;
        case TableColumn.METRIC_PEAK_UTILIZATION:
        case TableColumn.METRIC_AVERAGE_UTILIZATION:
          row[column] = `${Math.ceil(Number(rawValue))}%`;
          break;
        default:
          row[column] = rawValue;
      }
      return row;
    }, {})
  })
  
  const csvData = d3Dsv.csvFormat(formattedRows, rawTableData.columnHeaders as any)
  downloadFile(fileName, csvData, 'text/csv;charset=utf8;');
}
