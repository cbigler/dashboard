import * as d3Array from 'd3-array';
import * as d3Dsv from 'd3-dsv';
import getInObject from 'lodash/get';

import { ResourceStatus } from '../../types/resource';
import { AnalyticsFocusedMetric, AnalyticsReport, TableColumn } from '../../types/analytics';
import {
  getHighestAncestorName,
  formatSpaceType,
  formatSpaceFunction,
} from '../../components/analytics-table';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { downloadFile } from '../download-file';
import formatMetricName from '../analytics-formatters/metric-name';
import { TableDataItem, sum, average, getTableColumnKeys, RowData, computeTableData } from '../analytics-table';
import { sanitizeCSVDocument } from '../csv';


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
  const headerRow: Omit<RowData, 'space_id'> = {
    [TableColumn.SPACE_NAME]: 'Summary',
    [TableColumn.SPACE_LOCATION]: null,
    [TableColumn.SPACE_TYPE]: null,
    [TableColumn.SPACE_FUNCTION]: null,
    [TableColumn.SPACE_CAPACITY]: sum(tableData, d => d.space.target_capacity),
    
    [TableColumn.METRIC_PEAK_OCCUPANCY]: sum(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.MAX)),
    [TableColumn.METRIC_AVERAGE_OCCUPANCY]: sum(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.MAX)),
    
    [TableColumn.METRIC_PEAK_UTILIZATION]: average(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.UTILIZATION)),
    [TableColumn.METRIC_AVERAGE_UTILIZATION]: average(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.UTILIZATION)),

    [TableColumn.METRIC_MAXIMUM_ENTRANCES]: sum(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.ENTRANCES)),
    [TableColumn.METRIC_AVERAGE_ENTRANCES]: sum(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.ENTRANCES)),
    [TableColumn.METRIC_TOTAL_ENTRANCES]: sum(tableData, d => getTotalMetricValue(d, AnalyticsFocusedMetric.ENTRANCES)),

    [TableColumn.METRIC_MAXIMUM_EXITS]: sum(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.EXITS)),
    [TableColumn.METRIC_AVERAGE_EXITS]: sum(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.EXITS)),
    [TableColumn.METRIC_TOTAL_EXITS]: sum(tableData, d => getTotalMetricValue(d, AnalyticsFocusedMetric.EXITS)),

    [TableColumn.METRIC_MAXIMUM_EVENTS]: sum(tableData, d => getPeakMetricValue(d, AnalyticsFocusedMetric.EVENTS)),
    [TableColumn.METRIC_AVERAGE_EVENTS]: sum(tableData, d => getAverageMetricValue(d, AnalyticsFocusedMetric.EVENTS)),
    [TableColumn.METRIC_TOTAL_EVENTS]: sum(tableData, d => getTotalMetricValue(d, AnalyticsFocusedMetric.EVENTS)),

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
      [TableColumn.SPACE_TYPE]: formatSpaceType(tableDataItem.space.space_type),
      [TableColumn.SPACE_FUNCTION]: formatSpaceFunction(tableDataItem.space.function),
      [TableColumn.SPACE_CAPACITY]: tableDataItem.space.target_capacity,

      [TableColumn.METRIC_PEAK_OCCUPANCY]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.MAX),
      [TableColumn.METRIC_AVERAGE_OCCUPANCY]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.MAX),

      [TableColumn.METRIC_PEAK_UTILIZATION]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.UTILIZATION),
      [TableColumn.METRIC_AVERAGE_UTILIZATION]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.UTILIZATION),

      [TableColumn.METRIC_MAXIMUM_ENTRANCES]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.ENTRANCES),
      [TableColumn.METRIC_AVERAGE_ENTRANCES]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.ENTRANCES),
      [TableColumn.METRIC_TOTAL_ENTRANCES]: getTotalMetricValue(tableDataItem, AnalyticsFocusedMetric.ENTRANCES),

      [TableColumn.METRIC_MAXIMUM_EXITS]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.EXITS),
      [TableColumn.METRIC_AVERAGE_EXITS]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.EXITS),
      [TableColumn.METRIC_TOTAL_EXITS]: getTotalMetricValue(tableDataItem, AnalyticsFocusedMetric.EXITS),

      [TableColumn.METRIC_MAXIMUM_EVENTS]: getPeakMetricValue(tableDataItem, AnalyticsFocusedMetric.EVENTS),
      [TableColumn.METRIC_AVERAGE_EVENTS]: getAverageMetricValue(tableDataItem, AnalyticsFocusedMetric.EVENTS),
      [TableColumn.METRIC_TOTAL_EVENTS]: getTotalMetricValue(tableDataItem, AnalyticsFocusedMetric.EVENTS),

      [TableColumn.METRIC_OPPORTUNITY]: getInObject(tableDataItem.metricData, 'peakOpportunity'),
      [TableColumn.METRIC_AVERAGE_OPPORTUNITY]: withRounding(getInObject(tableDataItem.metricData, 'averageOpportunity')),
      [TableColumn.METRIC_OPPORTUNITY_COST]: withMultiplier(getInObject(tableDataItem.metricData, 'peakOpportunity'), opportunityCostPerPerson),
      [TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST]: withMultiplier(withRounding(getInObject(tableDataItem.metricData, 'averageOpportunity')), opportunityCostPerPerson),
      isChecked: tableDataItem.isVisible,
      space_id: tableDataItem.space.id,
    })
  })
  return {
    columnHeaders,
    headerRow,
    rows,
  }
}

export function exportAnalyticsTableData(report: AnalyticsReport, spaces: CoreSpace[]) {
  if (report.queryResult.status !== ResourceStatus.COMPLETE) return;
  const selectedSpaces: CoreSpace[] = report.queryResult.data.selectedSpaceIds
    .map(space_id => spaces.find(s => s.id === space_id))
    .filter(space => space != null) as CoreSpace[]
  const rawTableData = computeTableData(
    report.queryResult.data.metrics,
    selectedSpaces,
    report.selectedMetric,
    report.hiddenSpaceIds,
    report.columnSort,
    report.opportunityCostPerPerson,
  );

  if (rawTableData == null) return;

  const [startDate, endDate] = d3Array.extent(report.queryResult.data.datapoints, d => d.localDay);
  const metricColumnName = formatMetricName(report.selectedMetric);
  const interval = report.query.interval;

  const fileName = `density_summary_${interval}_${metricColumnName.replace(' ', '_').toLowerCase()}_${startDate}_${endDate}.csv`;

  // rows that are toggled off are not included in export
  const enabledRows = rawTableData.rows.filter(row => !report.hiddenSpaceIds.includes(row.space_id))
  
  const inputRows = [rawTableData.headerRow].concat(enabledRows);

  const formattedRows = inputRows.map(inputRow => {
    return rawTableData.columnHeaders.reduce((row, column) => {
      const rawValue = inputRow[column];
      if (rawValue == null) {
        row[column] = null;
        return row;
      }
      switch (column) {
        case TableColumn.METRIC_PEAK_OCCUPANCY:
        case TableColumn.METRIC_AVERAGE_OCCUPANCY:
        case TableColumn.METRIC_MAXIMUM_ENTRANCES:
        case TableColumn.METRIC_AVERAGE_ENTRANCES:
        case TableColumn.METRIC_TOTAL_ENTRANCES:
        case TableColumn.METRIC_MAXIMUM_EXITS:
        case TableColumn.METRIC_AVERAGE_EXITS:
        case TableColumn.METRIC_TOTAL_EXITS:
        case TableColumn.METRIC_MAXIMUM_EVENTS:
        case TableColumn.METRIC_AVERAGE_EVENTS:
        case TableColumn.METRIC_TOTAL_EVENTS:
        case TableColumn.METRIC_OPPORTUNITY:
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
  const sanitizedData = sanitizeCSVDocument(csvData)
  downloadFile(fileName, sanitizedData, 'text/csv;charset=utf8;');
}
