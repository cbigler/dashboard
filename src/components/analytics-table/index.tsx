import React, { Fragment, useState } from 'react';
import * as d3Array from 'd3-array';
import classnames from 'classnames';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceCountMetrics } from '../../types';
import getInObject from 'lodash/get';

import {
  ResourceStatus,
  AnalyticsFocusedMetric,
  QueryInterval,
  AnalyticsReport,
} from '../../types/analytics';
import { formatSpaceFunction } from '../../helpers/space-function-choices';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import { ascending, descending } from '../../helpers/natural-sorting';

import {
  Icons,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  getNextSortDirection,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import Checkbox from '../checkbox';

type TableDataItem = {
  space: DensitySpace,
  isVisible: boolean,
  metricData: DensitySpaceCountMetrics | {},
};

enum SortDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
  NONE = 'none',
}

type SortColumn = string | null;
type SortFunction = (a: any, b: any) => number;

const INACTIVE_CHEVRON_COLOR = colorVariables.gray,
      ACTIVE_CHEVRON_COLOR = colorVariables.grayCinder;

function formatSpaceType(spaceType: DensitySpaceTypes) {
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

const sum = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.sum(tableData, accessor);
const average = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.mean(tableData, accessor);
const max = (tableData: TableDataItem[], accessor: AccessorFunction) => d3Array.max(tableData, accessor);

function Header({label, value, denominator='', spaceSortDirection, spaceSortColumn, right=false}) {
  const chevronColor = spaceSortColumn === label && spaceSortDirection !== SortDirection.NONE ? ACTIVE_CHEVRON_COLOR : INACTIVE_CHEVRON_COLOR;
  const chevronFlipped = spaceSortColumn === label && spaceSortDirection === SortDirection.ASCENDING
  return (
    <div className={classnames(styles.header, {[styles.right]: right})}>
      <span className={styles.headerLabel}>
        {label}
        {chevronFlipped ? (
          <Icons.ChevronUp color={chevronColor} />
        ) : (
          <Icons.ChevronDown color={chevronColor} />
        )}
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

function getHighestAncestorName(space: DensitySpace): string {
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
  onChangeHiddenSpaceIds: (spaceIds: string[]) => void,
}> = function AnalyticsTable({
  spaces,
  analyticsReport,

  onChangeHiddenSpaceIds,
}) {
  const [sorting, setSorting] = useState<[SortDirection, SortColumn, SortFunction]>([SortDirection.NONE, null, () => 0])
  const [spaceSortDirection, spaceSortColumn, spaceSortFunction] = sorting;

  // Skip rendering the table if the analytics query has not been loaded.
  if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) {
    return null;
  }

  const selectedSpaces = analyticsReport.queryResult.data.selectedSpaceIds
    .map(id => spaces.find(space => space.id === id))
    .filter(space => Boolean(space)) as Array<DensitySpace>

  const tableData: Array<TableDataItem> = selectedSpaces.map(space => {
    if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) throw new Error('Should not be possible');
    return {
      space,
      isVisible: !analyticsReport.hiddenSpaceIds.includes(space.id),
      metricData: analyticsReport.queryResult.data.metrics[space.id],
    }
  }).sort(spaceSortFunction);

  const formatMetricNumber = (n: any) => {
    if (typeof n === 'number' && !isNaN(n)) {
      return String(Math.ceil(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    } else {
      return '--';
    }
  };

  function changeSpaceVisibility(space, visible) {
    const hiddenSpaceIdsWithoutSpace = (
      analyticsReport.hiddenSpaceIds.filter(id => id !== space.id)
    );
    if (visible) {
      onChangeHiddenSpaceIds(hiddenSpaceIdsWithoutSpace);
    } else {
      onChangeHiddenSpaceIds([...hiddenSpaceIdsWithoutSpace, space.id]);
    }
  }

  const allSpacesVisible = tableData.every(i => i.isVisible);

  return (
    <div className={styles.wrapper}>
      <ListView
        rowHeight={38}
        headerHeight={56}
        fontSize={14}
        data={tableData}
        sort={[{
          column: spaceSortColumn,
          direction: spaceSortDirection
        }]}
        onClickHeader={(column: string, template: Function | undefined) => {
          if (!template) { return; }
          const lastSortDirection = column === spaceSortColumn ? spaceSortDirection : 'none';
          const sortDirection = getNextSortDirection(lastSortDirection);
          const sortFunction = (() => {
            switch (sortDirection) {
              case SortDirection.ASCENDING:
                return (a: TableDataItem, b: TableDataItem) => ascending(template(a), template(b))
              case SortDirection.DESCENDING:
                return (a: TableDataItem, b: TableDataItem) => descending(template(a), template(b))
              default:
                return (a:any, b:any) => 0
            }
          })()
          setSorting([sortDirection, column, sortFunction])
        }}
      >
        <ListViewColumn
          id="Space"
          title={
            <div className={styles.header}>
              <span className={styles.tableSpaceHeader}>
                <Checkbox
                  checked={allSpacesVisible}
                  onChange={e => onChangeHiddenSpaceIds((e.target as HTMLInputElement).checked ? [] : selectedSpaces.map(i => i.id))}
                  color={colorVariables.grayDarker}
                />
                <span className={styles.tableSpaceLabel}>
                  Space
                  {spaceSortColumn === 'Space' && spaceSortDirection === SortDirection.ASCENDING ? (
                    <Icons.ChevronUp color={ACTIVE_CHEVRON_COLOR} />
                  ) : (
                    <Icons.ChevronDown color={spaceSortColumn === 'Space' && spaceSortDirection === SortDirection.DESCENDING ? ACTIVE_CHEVRON_COLOR : INACTIVE_CHEVRON_COLOR} />
                  )}
                </span>
              </span>
              <div className={classnames(styles.headerFakeRowText, styles.all)}>
                All
              </div>
            </div>
          }
          onClick={(x: TableDataItem) => changeSpaceVisibility(x.space, !x.isVisible)}
          width={240}
          valueTemplate={(x: TableDataItem) => x.space.name}
          template={(x: TableDataItem) => (
            <span
              className={styles.tableSpace}
              style={{ color: analyticsColorScale(x.space.id) }}
            >
              <Checkbox
                id={x.space.id}
                checked={x.isVisible}
                color={analyticsColorScale(x.space.id)}
                onChange={e => {
                  const visible = (e.target as HTMLInputElement).checked;
                  changeSpaceVisibility(x.space, visible);
                }}
              />
              <span className={styles.tableSpaceLabel}>{x.space.name}</span>
            </span>
          )}
        />
        <ListViewColumn
          id="Location"
          width="20%"
          title={
            <Header
              label="Location"
              value="---"
              spaceSortDirection={spaceSortDirection}
              spaceSortColumn={spaceSortColumn}
            />
          }
          valueTemplate={(x: TableDataItem) => getHighestAncestorName(x.space)}
          template={(x: TableDataItem) => (
            <span className={styles.ellipsis}>
              {getHighestAncestorName(x.space)}
            </span>
          )}
        />
        <ListViewColumn
          id="Type"
          width={80}
          title={
            <Header
              label="Type"
              value="---"
              spaceSortDirection={spaceSortDirection}
              spaceSortColumn={spaceSortColumn}
            />
          }
          template={(x: TableDataItem) => formatSpaceType(x.space.spaceType)}
        />
        <ListViewColumn
          id="Function"
          width="15%"
          title={
            <Header
              label="Function"
              value="---"
              spaceSortDirection={spaceSortDirection}
              spaceSortColumn={spaceSortColumn}
            />
          }
          template={(x: TableDataItem) => (
            <span className={styles.ellipsis}>
              {x.space['function'] ? formatSpaceFunction(x.space['function']) : '---'}
            </span>
          )}
        />
        <ListViewColumn
          id="Capacity"
          width={72}
          title={
            <Header
              label="Capacity"
              value="---"
              spaceSortDirection={spaceSortDirection}
              spaceSortColumn={spaceSortColumn}
            />
          }
          valueTemplate={(x: TableDataItem) => x.space.targetCapacity}
          template={(x: TableDataItem) => x.space.targetCapacity ? formatMetricNumber(x.space.targetCapacity) : '---'}
        />
        <ListViewColumnSpacer />

        {/* COUNT */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.MAX ? (
          <Fragment>
            <ListViewColumn
              id="Peak"
              align="right"
              width={100}
              title={
                <Header
                  label="Peak"
                  value={formatMetricNumber(max(tableData, x => getInObject(x.metricData, 'count.max.value')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'count.max.value', NaN)}
              template={(x: TableDataItem) => formatMetricNumber(getInObject(x.metricData, 'count.max.value'))}
            />
            <ListViewColumn
              id="Average"
              align="right"
              width={100}
              title={
                <Header
                  label="Average"
                  value={formatMetricNumber(average(tableData, x => getInObject(x.metricData, 'count.average')))}
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'count.average')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'count.average'))}
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
              id="Peak"
              title={
                <Header
                  label="Peak"
                  value={(
                    <Fragment>
                      {formatMetricNumber(max(tableData, x => getInObject(x.metricData, 'target_utilization.max.value')))}%
                    </Fragment>
                  )}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              width={130}
              align="right"
              valueTemplate={(x: TableDataItem) => formatMetricNumber(getInObject(x.metricData, 'target_utilization.max.value'))}
              template={(x: TableDataItem) => <span>{formatMetricNumber(getInObject(x.metricData, 'target_utilization.max.value'))}%</span>}
            />
            <ListViewColumn
              id="Average"
              title={
                <Header
                  label="Average"
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={<Fragment>
                    {formatMetricNumber(average(tableData, x => getInObject(x.metricData, 'target_utilization.average')))}%
                  </Fragment>}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              align="right"
              width={130}
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'target_utilization.average')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'target_utilization.average'))}%
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
              id="Peak"
              align="right"
              width={100}
              title={
                <Header
                  label="Peak"
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(max(tableData, x => getInObject(x.metricData, 'entrances.peak.value')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'entrances.peak.value')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'entrances.peak.value'))}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id="Average"
              align="right"
              width={100}
              title={
                <Header
                  label="Average"
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(average(tableData, x => getInObject(x.metricData, 'entrances.average')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'entrances.average')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'entrances.average'))}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id="Total"
              width={100}
              align="right"
              title={
                <Header
                  label="Total"
                  value={formatMetricNumber(sum(tableData, x => getInObject(x.metricData, 'entrances.total')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'entrances.total')}
              template={(x: TableDataItem) => formatMetricNumber(getInObject(x.metricData, 'entrances.total'))}
            />
          </Fragment>
        ) : null}

        {/* EXITS */}
        {analyticsReport.selectedMetric === AnalyticsFocusedMetric.EXITS ? (
          <Fragment>
            <ListViewColumn
              id="Peak"
              align="right"
              width={100}
              title={
                <Header
                  label="Peak"
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(max(tableData, x => getInObject(x.metricData, 'exits.peak.value')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'exits.peak.value')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'exits.peak.value'))}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id="Average"
              align="right"
              width={100}
              title={
                <Header
                  label="Average"
                  denominator={formatQueryInterval(analyticsReport.query.interval)}
                  value={formatMetricNumber(average(tableData, x => getInObject(x.metricData, 'exits.average')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'exits.average')}
              template={(x: TableDataItem) => (
                <Fragment>
                  {formatMetricNumber(getInObject(x.metricData, 'exits.average'))}
                  <span className={styles.denominator}> / {formatQueryInterval(analyticsReport.query.interval)}</span>
                </Fragment>
              )}
            />
            <ListViewColumn
              id="Total"
              width={100}
              align="right"
              title={
                <Header
                  label="Total"
                  value={formatMetricNumber(sum(tableData, x => getInObject(x.metricData, 'exits.total')))}
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                  right
                />
              }
              valueTemplate={(x: TableDataItem) => getInObject(x.metricData, 'exits.total')}
              template={(x: TableDataItem) => formatMetricNumber(getInObject(x.metricData, 'exits.total'))}
            />
          </Fragment>
        ) : null}
      </ListView>
    </div>
  );
}

export default AnalyticsTable;