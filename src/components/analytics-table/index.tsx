import React, { Fragment } from 'react';
import * as d3Array from 'd3-array';
import classnames from 'classnames';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceCountMetrics, DensitySpaceFunction } from '../../types';
import getInObject from 'lodash/get';

import {
  ResourceStatus,
  AnalyticsFocusedMetric,
  QueryInterval,
  AnalyticsReport,
  TableColumn,
  TableColumnSort,
  SortDirection,
} from '../../types/analytics';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import { ascending, descending } from '../../helpers/natural-sorting';

import {
  Icons,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import Checkbox from '../checkbox';
import { getTableValues } from '../../helpers/analytics-data-export/table';
import startCase from 'lodash/startCase';

export type TableDataItem = {
  space: DensitySpace,
  isVisible: boolean,
  metricData: DensitySpaceCountMetrics | {},
};



function getTableColumnHeaderText(tableColumn: TableColumn): string {
  // for now, the enum value will be used as the header text... feel free to make this a switch if needed
  return String(tableColumn);
}


const SortIcon: React.FC<{
  column: TableColumn,
  columnSort: TableColumnSort,
}> = function SortIcon({
  column,
  columnSort,
}) {
  const isSortEnabled = columnSort.column === column && columnSort.direction !== SortDirection.NONE;
  const sortIconColor = isSortEnabled ? ACTIVE_CHEVRON_COLOR : INACTIVE_CHEVRON_COLOR;
  return columnSort.direction === SortDirection.DESCENDING || !isSortEnabled ? (
    <Icons.ChevronDown color={sortIconColor} />
  ) : (
    <Icons.ChevronUp color={sortIconColor} />
  )
}

export function getTableColumnKeys(selectedMetric: AnalyticsFocusedMetric) {
  switch (selectedMetric) {
    case AnalyticsFocusedMetric.MAX:
    case AnalyticsFocusedMetric.UTILIZATION:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_LOCATION,
        TableColumn.SPACE_TYPE,
        TableColumn.SPACE_FUNCTION,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_PEAK,
        TableColumn.METRIC_AVERAGE,
        // <- no METRIC_TOTAL column for Occupancy metrics
      ];
    case AnalyticsFocusedMetric.ENTRANCES:
    case AnalyticsFocusedMetric.EXITS:
    case AnalyticsFocusedMetric.EVENTS:
      return [
        TableColumn.SPACE_NAME,
        TableColumn.SPACE_LOCATION,
        TableColumn.SPACE_TYPE,
        TableColumn.SPACE_FUNCTION,
        TableColumn.SPACE_CAPACITY,
        TableColumn.METRIC_PEAK,
        TableColumn.METRIC_AVERAGE,
        TableColumn.METRIC_TOTAL,
      ];
  }
}

export type ColumnKey = ReturnType<typeof getTableColumnKeys>[number];
export type RowData = {
  'Space': string,
  'Location': string | null,
  'Type': string | null,
  'Function': string | null,
  'Capacity': number | null,
  'Peak': number | null | undefined,
  'Average': number | null | undefined,
  'Total': number | null | undefined,
  // FIXME: not great...
  spaceId: string,
  isChecked: boolean,
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

export function computeTableData(analyticsReport: AnalyticsReport, selectedSpaces: DensitySpace[], columnSort: TableColumnSort) {
  // Skip rendering the table if the analytics query has not been loaded.
  if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) {
    return null;
  }

  const tableData: Array<TableDataItem> = selectedSpaces.map(space => {
    if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) throw new Error('Should not be possible');
    return {
      space,
      isVisible: !analyticsReport.hiddenSpaceIds.includes(space.id),
      metricData: analyticsReport.queryResult.data.metrics[space.id],
    }
  });

  const data = getTableValues(tableData, analyticsReport.selectedMetric);

  return {
    ...data,
    rows: data.rows.sort(getSortFunction(columnSort)),
  }
}

const ACTIVE_CHEVRON_COLOR = colorVariables.grayCinder;
const INACTIVE_CHEVRON_COLOR = colorVariables.gray;

export function formatSpaceType(spaceType: DensitySpaceTypes) {
  switch (spaceType) {
  case DensitySpaceTypes.BUILDING:
    return 'Building';
  case DensitySpaceTypes.CAMPUS:
    return 'Campus';
  case DensitySpaceTypes.FLOOR:
    return 'Floor';
  case DensitySpaceTypes.SPACE:
    return 'Space';
  default:
    return spaceType;
  }
}

export function formatSpaceFunction(spaceFunction: DensitySpaceFunction | null) {
  if (spaceFunction == null) return '--';
  return startCase(spaceFunction);
}

function formatQueryInterval(interval: QueryInterval): string {
  switch (interval) {
  case QueryInterval.ONE_DAY:
    return 'day';
  case QueryInterval.ONE_HOUR:
    return 'hour';
  case QueryInterval.FIFTEEN_MINUTES:
    return '15 min';
  default:
    return interval;
  }
}

type AccessorFunction = (d: TableDataItem) => number | null | undefined;

export const sum = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.sum(tableData, accessor);
export const average = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.mean(tableData, accessor);
export const max = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.max(tableData, accessor);


const Header: React.FC<{
  label: string,
  value: number | string,
  column: TableColumn,
  columnSort: TableColumnSort,
  denominator?: string,
  right?: boolean,
}> = function Header({
  label,
  value,
  column,
  columnSort,
  denominator='',
  right=false
}) {
  return (
    <div className={classnames(styles.header, {[styles.right]: right})}>
      <span className={styles.headerLabel}>
        {label}
        {<SortIcon column={column} columnSort={columnSort} />}
      </span>
      <div className={styles.headerFakeRowText}>
        {value}
        {denominator ? (
          <span className={styles.headerFakeRowDenominator}> / {denominator}</span>
        ) : null}
      </div>
    </div>
  );
}

export function getHighestAncestorName(space: DensitySpace): string {
  if (space.ancestry.length > 0) {
    return space.ancestry[space.ancestry.length-1].name;
  } else {
    // Highest ancestor is the space itself
    return space.name;
  }
}

const AnalyticsTable: React.FC<{
  spaces: DensitySpace[],
  analyticsReport: AnalyticsReport,
  onClickColumnHeader: (column: TableColumn) => void,
  onChangeHiddenSpaceIds: (spaceIds: string[]) => void,
}> = function AnalyticsTable({
  spaces,
  analyticsReport,
  onClickColumnHeader,
  onChangeHiddenSpaceIds,
}) {

  if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) return null;

  const { columnSort } = analyticsReport;

  const selectedSpaces = analyticsReport.queryResult.data.selectedSpaceIds
    .map(id => spaces.find(space => space.id === id))
    .filter(space => Boolean(space)) as Array<DensitySpace>

  // Compute the table from the report
  const tableData = computeTableData(analyticsReport, selectedSpaces, columnSort);
  
  // Render nothing if the data is not ready or invalid
  if (tableData === null) return null;

  const formatMetricNumber = (n: any) => {
    if (typeof n === 'number' && !isNaN(n)) {
      return String(Math.ceil(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    } else {
      return '--';
    }
  };

  function changeSpaceVisibility(spaceId: string, visible: boolean) {
    const hiddenSpaceIdsWithoutSpace = (
      analyticsReport.hiddenSpaceIds.filter(id => id !== spaceId)
    );
    if (visible) {
      onChangeHiddenSpaceIds(hiddenSpaceIdsWithoutSpace);
    } else {
      onChangeHiddenSpaceIds([...hiddenSpaceIdsWithoutSpace, spaceId]);
    }
  }

  const allSpacesEnabled = tableData.rows.every(i => i.isChecked);

  return (
    <div className={styles.wrapper}>
      <ListView
        rowHeight={38}
        headerHeight={56}
        fontSize={14}
        data={tableData.rows}
        onClickHeader={onClickColumnHeader}
      >
        <ListViewColumn
          id={TableColumn.SPACE_NAME}
          title={(
            <div className={styles.header}>
              <span className={styles.tableSpaceHeader}>
                <Checkbox
                  checked={allSpacesEnabled}
                  onChange={evt => {
                    if (evt.target.checked) {
                      // enable all spaces
                      onChangeHiddenSpaceIds([]);
                    } else {
                      // disable all spaces
                      onChangeHiddenSpaceIds(selectedSpaces.map(s => s.id));
                    }
                  }}
                  color={colorVariables.grayDarker}
                />
                <span className={styles.tableSpaceLabel}>
                  {getTableColumnHeaderText(TableColumn.SPACE_NAME)}
                  {<SortIcon column={TableColumn.SPACE_NAME} columnSort={columnSort} />}
                </span>
              </span>
              <div className={classnames(styles.headerFakeRowText, styles.all)}>
                {'All'}
              </div>
            </div>
          )}
          onClick={(d: RowData) => changeSpaceVisibility(d.spaceId, !d.isChecked)}
          width={240}
          valueTemplate={(d: RowData) => d[TableColumn.SPACE_NAME]}
          template={(d: RowData) => (
            <span
              className={styles.tableSpace}
              style={{ color: analyticsColorScale(d.spaceId) }}
            >
              <Checkbox
                id={d.spaceId}
                checked={d.isChecked}
                color={analyticsColorScale(d.spaceId)}
                onChange={evt => {
                  const visible = evt.target.checked;
                  changeSpaceVisibility(d.spaceId, visible);
                }}
              />
              <span className={styles.tableSpaceLabel}>{d[TableColumn.SPACE_NAME]}</span>
            </span>
          )}
        />
        <ListViewColumn
          id={TableColumn.SPACE_LOCATION}
          width="20%"
          title={
            <Header
              label={getTableColumnHeaderText(TableColumn.SPACE_LOCATION)}
              value="---"
              column={TableColumn.SPACE_LOCATION}
              columnSort={columnSort}
            />
          }
          valueTemplate={(d: RowData) => d[TableColumn.SPACE_LOCATION]}
          template={(d: RowData) => (
            <span className={styles.ellipsis}>
              {d[TableColumn.SPACE_LOCATION]}
            </span>
          )}
        />
        <ListViewColumn
          id={TableColumn.SPACE_TYPE}
          width={80}
          title={
            <Header
              label={getTableColumnHeaderText(TableColumn.SPACE_TYPE)}
              value="---"
              column={TableColumn.SPACE_TYPE}
              columnSort={columnSort}
            />
          }
          template={(d: RowData) => d[TableColumn.SPACE_TYPE]}
        />
        <ListViewColumn
          id={TableColumn.SPACE_FUNCTION}
          width="15%"
          title={
            <Header
              label={getTableColumnHeaderText(TableColumn.SPACE_FUNCTION)}
              value="---"
              column={TableColumn.SPACE_FUNCTION}
              columnSort={columnSort}
            />
          }
          template={(d: RowData) => (
            <span className={styles.ellipsis}>
              {d[TableColumn.SPACE_FUNCTION]}
            </span>
          )}
        />
        <ListViewColumn
          id={TableColumn.SPACE_CAPACITY}
          width={72}
          title={
            <Header
              label={getTableColumnHeaderText(TableColumn.SPACE_CAPACITY)}
              value="---"
              column={TableColumn.SPACE_CAPACITY}
              columnSort={columnSort}
            />
          }
          valueTemplate={(d: RowData) => d[TableColumn.SPACE_CAPACITY]}
          template={(d: RowData) => formatMetricNumber(d[TableColumn.SPACE_CAPACITY])}
        />
        <ListViewColumnSpacer />

        {/* OCCUPANCY */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.MAX ? (
          <Fragment>
            <ListViewColumn
              id={TableColumn.METRIC_PEAK}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_PEAK)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_PEAK])}
                  column={TableColumn.METRIC_PEAK}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => formatMetricNumber(d[TableColumn.METRIC_PEAK])}
              template={(d: RowData) => formatMetricNumber(d[TableColumn.METRIC_PEAK])}
            />
            <ListViewColumn
              id={TableColumn.METRIC_AVERAGE}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_AVERAGE)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_AVERAGE])}
                  column={TableColumn.METRIC_PEAK}
                  columnSort={columnSort}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_AVERAGE]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_AVERAGE])}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
          </Fragment>
        ) : null}

        {/* UTILIZATION */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.UTILIZATION ? (
          <Fragment>
            <ListViewColumn
              id={TableColumn.METRIC_PEAK}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_PEAK)}
                  value={`${formatMetricNumber(tableData.headerRow[TableColumn.METRIC_PEAK])}%`}
                  column={TableColumn.METRIC_PEAK}
                  columnSort={columnSort}
                  right={true}
                />
              }
              width={130}
              align="right"
              valueTemplate={(d: RowData) => formatMetricNumber(d[TableColumn.METRIC_PEAK])}
              template={(d: RowData) => <span>{formatMetricNumber(d[TableColumn.METRIC_PEAK])}%</span>}
            />
            <ListViewColumn
              id={TableColumn.METRIC_AVERAGE}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_AVERAGE)}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={`${formatMetricNumber(tableData.headerRow[TableColumn.METRIC_AVERAGE])}%`}
                  column={TableColumn.METRIC_AVERAGE}
                  columnSort={columnSort}
                  right={true}
                />
              }
              align="right"
              width={130}
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_AVERAGE]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_AVERAGE])}%
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
          </Fragment>
        ) : null}

        {/* ENTRANCES */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.ENTRANCES ? (
          <Fragment>
            <ListViewColumn
              id={TableColumn.METRIC_PEAK}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_PEAK)}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_PEAK])}
                  column={TableColumn.METRIC_PEAK}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_PEAK]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_PEAK])}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id={TableColumn.METRIC_AVERAGE}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_AVERAGE)}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_AVERAGE])}
                  column={TableColumn.METRIC_AVERAGE}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_AVERAGE]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_AVERAGE])}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id={TableColumn.METRIC_TOTAL}
              width={100}
              align="right"
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_TOTAL)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_TOTAL])}
                  column={TableColumn.METRIC_TOTAL}
                  columnSort={columnSort}
                  right
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_TOTAL]}
              template={(d: RowData) => formatMetricNumber(d[TableColumn.METRIC_TOTAL])}
            />
          </Fragment>
        ) : null}

        {/* EXITS */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.EXITS ? (
          <Fragment>
            <ListViewColumn
              id={TableColumn.METRIC_PEAK}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_PEAK)}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_PEAK])}
                  column={TableColumn.METRIC_PEAK}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_PEAK]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_PEAK])}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id={TableColumn.METRIC_AVERAGE}
              align="right"
              width={100}
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_AVERAGE)}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_AVERAGE])}
                  column={TableColumn.METRIC_AVERAGE}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_AVERAGE]}
              template={(d: RowData) => (
                <Fragment>
                  {formatMetricNumber(d[TableColumn.METRIC_AVERAGE])}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id={TableColumn.METRIC_TOTAL}
              width={100}
              align="right"
              title={
                <Header
                  label={getTableColumnHeaderText(TableColumn.METRIC_TOTAL)}
                  value={formatMetricNumber(tableData.headerRow[TableColumn.METRIC_TOTAL])}
                  column={TableColumn.METRIC_TOTAL}
                  columnSort={columnSort}
                  right={true}
                />
              }
              valueTemplate={(d: RowData) => d[TableColumn.METRIC_TOTAL]}
              template={(d: RowData) => formatMetricNumber(d[TableColumn.METRIC_TOTAL])}
            />
          </Fragment>
        ) : null}
      </ListView>
    </div>
  );
}

export default AnalyticsTable;