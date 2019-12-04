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
      return null;
  }
}
  
function getTotalMetricValue(tableDataItem: TableDataItem, selectedMetric: AnalyticsFocusedMetric): number | null {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
    case AnalyticsFocusedMetric.UTILIZATION:
      return null;
    case AnalyticsFocusedMetric.ENTRANCES:
      return getInObject(tableDataItem.metricData, 'entrances.total', null);
    case AnalyticsFocusedMetric.EXITS:
      return getInObject(tableDataItem.metricData, 'exits.total', null);
    case AnalyticsFocusedMetric.EVENTS:
      return null;
  }
}
  
export function getTableValues(tableData: TableDataItem[], selectedMetric: AnalyticsFocusedMetric) {
  const columnHeaders = getTableColumnKeys(selectedMetric);
  const rows: Array<RowData> = [];
  // header row (aggregations)
  const headerRow: Omit<RowData, 'spaceId'> = {
    'Space': 'All',
    'Location': null,
    'Type': null,
    'Function': null,
    'Capacity': null,
    'Peak': max(tableData, d => getPeakMetricValue(d, selectedMetric)),
    'Average': average(tableData, d => getAverageMetricValue(d, selectedMetric)),
    'Total': sum(tableData, d => getTotalMetricValue(d, selectedMetric)),
    isChecked: tableData.some(d => d.isVisible),
  };
  tableData.forEach(tableDataItem => {
    rows.push({
      'Space': tableDataItem.space.name,
      'Location': getHighestAncestorName(tableDataItem.space),
      'Type': formatSpaceType(tableDataItem.space.spaceType),
      'Function': formatSpaceFunction(tableDataItem.space.function),
      'Capacity': tableDataItem.space.targetCapacity,
      'Peak': getPeakMetricValue(tableDataItem, selectedMetric),
      'Average': getAverageMetricValue(tableDataItem, selectedMetric),
      'Total': getTotalMetricValue(tableDataItem, selectedMetric),
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

  const fileName = `density_summary_${interval}_${metricColumnName.toLowerCase()}_${startDate}_${endDate}.csv`;

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
        default:
          row[column] = rawValue;
      }
      return row;
    }, {})
  })
  
  const csvData = d3Dsv.csvFormat(formattedRows, rawTableData.columnHeaders as any)
  downloadFile(fileName, csvData, 'text/csv;charset=utf8;');
}
