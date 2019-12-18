import * as d3Array from 'd3-array';
import getInObject from 'lodash/get';

import { DensitySpace, DensitySpaceCountMetrics } from "../../types";
import { getTableValues } from "../analytics-data-export/table";
import { TableColumnSort, SortDirection, TableColumn, AnalyticsFocusedMetric, AnalyticsMetrics } from "../../types/analytics";
import { ascending, descending } from '../natural-sorting';


// TODO: move `getTableValues` into this file

export type TableDataItem = {
  space: DensitySpace,
  isVisible: boolean,
  metricData: DensitySpaceCountMetrics | {},
};

export type ColumnKey = ReturnType<typeof getTableColumnKeys>[number];
export type RowData = {
  [TableColumn.SPACE_NAME]: string,
  [TableColumn.SPACE_LOCATION]: string | null,
  [TableColumn.SPACE_TYPE]: string | null,
  [TableColumn.SPACE_FUNCTION]: string | null,
  [TableColumn.SPACE_CAPACITY]: number | null,
  // occupancy
  [TableColumn.METRIC_PEAK_OCCUPANCY]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_OCCUPANCY]: number | null | undefined,
  // utilization
  [TableColumn.METRIC_PEAK_UTILIZATION]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_UTILIZATION]: number | null | undefined,
  // entrances
  [TableColumn.METRIC_MAXIMUM_ENTRANCES]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_ENTRANCES]: number | null | undefined,
  [TableColumn.METRIC_TOTAL_ENTRANCES]: number | null | undefined,
  // exits
  [TableColumn.METRIC_MAXIMUM_EXITS]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_EXITS]: number | null | undefined,
  [TableColumn.METRIC_TOTAL_EXITS]: number | null | undefined,
  // events
  [TableColumn.METRIC_MAXIMUM_EVENTS]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_EVENTS]: number | null | undefined,
  [TableColumn.METRIC_TOTAL_EVENTS]: number | null | undefined,
  // available capacity
  [TableColumn.METRIC_OPPORTUNITY]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_OPPORTUNITY]: number | null | undefined,
  [TableColumn.METRIC_OPPORTUNITY_COST]: number | null | undefined,
  [TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST]: number | null | undefined,
  // FIXME: not great...
  spaceId: string,
  isChecked: boolean,
}

type AccessorFunction = (d: TableDataItem) => number | null | undefined;

export const sum = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.sum(tableData, accessor);
export const average = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.mean(tableData, accessor);
export const max = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.max(tableData, accessor);

/**
 * This determines which columns are shown when a metric is selected
 */
export function getTableColumnKeys(selectedMetric: AnalyticsFocusedMetric) {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_PEAK_OCCUPANCY,
        TableColumn.METRIC_AVERAGE_OCCUPANCY,
      ]
    case AnalyticsFocusedMetric.UTILIZATION:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_PEAK_UTILIZATION,
        TableColumn.METRIC_AVERAGE_UTILIZATION,
      ];
    case AnalyticsFocusedMetric.ENTRANCES:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_MAXIMUM_ENTRANCES,
        TableColumn.METRIC_AVERAGE_ENTRANCES,
        TableColumn.METRIC_TOTAL_ENTRANCES,
      ];
    case AnalyticsFocusedMetric.EXITS:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_MAXIMUM_EXITS,
        TableColumn.METRIC_AVERAGE_EXITS,
        TableColumn.METRIC_TOTAL_EXITS,
      ];
    case AnalyticsFocusedMetric.EVENTS:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_MAXIMUM_EVENTS,
        TableColumn.METRIC_AVERAGE_EVENTS,
        TableColumn.METRIC_TOTAL_EVENTS,
      ];
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_PEAK_UTILIZATION,
        TableColumn.METRIC_AVERAGE_UTILIZATION,
        TableColumn.METRIC_OPPORTUNITY,
        TableColumn.METRIC_AVERAGE_OPPORTUNITY,
        TableColumn.METRIC_OPPORTUNITY_COST,
        TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST,
      ]
  }
}

export function getDefaultColumnSortForMetric(selectedMetric: AnalyticsFocusedMetric): TableColumnSort {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
      return {
        column: TableColumn.METRIC_AVERAGE_OCCUPANCY,
        direction: SortDirection.DESCENDING,
      };
    case AnalyticsFocusedMetric.UTILIZATION:
      return {
        column: TableColumn.METRIC_AVERAGE_UTILIZATION,
        direction: SortDirection.DESCENDING,
      };
    case AnalyticsFocusedMetric.ENTRANCES:
      return {
        column: TableColumn.METRIC_AVERAGE_ENTRANCES,
        direction: SortDirection.DESCENDING,
      };
    case AnalyticsFocusedMetric.EXITS:
      return {
        column: TableColumn.METRIC_AVERAGE_EXITS,
        direction: SortDirection.DESCENDING,
      };
    case AnalyticsFocusedMetric.EVENTS:
      return {
        column: TableColumn.METRIC_AVERAGE_EVENTS,
        direction: SortDirection.DESCENDING,
      };
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return {
        column: TableColumn.METRIC_AVERAGE_OPPORTUNITY,
        direction: SortDirection.DESCENDING,
      };
  }
}

function getSortFunction(columnSort: TableColumnSort) {
  const unsorted = () => 0;
  const { column } = columnSort;
  if (column === null) return unsorted;
  const accessor = (row: RowData): number | string | null => getInObject(row, column, null);
  switch (columnSort.direction) {
    case SortDirection.NONE:
      return unsorted;
    case SortDirection.ASCENDING:
      return (a: RowData, b: RowData) => ascending(accessor(a), accessor(b));
    case SortDirection.DESCENDING:
      return (a: RowData, b: RowData) => descending(accessor(a), accessor(b));
  }
}

export function computeTableData(
  metrics: AnalyticsMetrics,
  selectedSpaces: DensitySpace[],
  selectedMetric: AnalyticsFocusedMetric,
  hiddenSpaceIds: string[],
  columnSort: TableColumnSort,
  opportunityCostPerPerson: number,
) {


  const tableData: Array<TableDataItem> = selectedSpaces.map(space => {
    return {
      space,
      isVisible: !hiddenSpaceIds.includes(space.id),
      metricData: metrics[space.id],
    }
  });

  const data = getTableValues(tableData, selectedMetric, opportunityCostPerPerson);

  return {
    ...data,
    rows: data.rows.sort(getSortFunction(columnSort)),
  }
}