import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceCountMetrics } from '../../types';
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
import {
  ResourceStatus,
  AnalyticsFocusedMetric,
} from '../../types/analytics';

type TableDataItem = {
  space: DensitySpace,
  isVisible: boolean,
  metricData: DensitySpaceCountMetrics,
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

function sum(acc: number, n: number): number {
  return acc + n;
}

function Header({label, value, spaceSortDirection, spaceSortColumn, right=false}) {
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
      </div>
    </div>
  );
}
// {Math.max(...tableData.map(x => x.metricData.count.max.value))}

export default function AnalyticsTable({
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

  const selectedSpaces: Array<DensitySpace> = analyticsReport.queryResult.data.selectedSpaceIds
    .map(id => spaces.find(space => space.id === id))
    .filter(space => Boolean(space))

  const tableData: Array<TableDataItem> = selectedSpaces.map(space => ({
    space,
    isVisible: !analyticsReport.hiddenSpaceIds.includes(space.id),
    metricData: analyticsReport.queryResult.data.metrics[space.id],
  })).sort(spaceSortFunction);

  const formatMetricNumber = (n: any) => {
    if (typeof n === 'number') {
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
    <div className={styles.tableSection}>
      <div className={styles.spacesDataTable}>
        <div className={styles.tableView}>
          <ListView
            rowHeight={38}
            headerHeight={56}
            data={tableData}
            sort={[{
              column: spaceSortColumn,
              direction: spaceSortDirection
            }]}
            onClickHeader={(column: string, template: Function) => {
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
                  style={{ color: analyticsColorScale(x.space) }}
                >
                  <Checkbox
                    checked={x.isVisible}
                    color={analyticsColorScale(x.space)}
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
              width={400}
              title={
                <Header
                  label="Location"
                  value="---"
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                />
              }
              template={(x: TableDataItem) => x.space.ancestry.map(i => i.name).join(' / ')}
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
              width={180}
              title={
                <Header
                  label="Function"
                  value="---"
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                />
              }
              template={(x: TableDataItem) => x.space['function'] ? formatSpaceFunction(x.space['function']) : <em>N/A</em>}
            />
            <ListViewColumn
              id="Capacity"
              width={180}
              title={
                <Header
                  label="Capacity"
                  value="---"
                  spaceSortDirection={spaceSortDirection}
                  spaceSortColumn={spaceSortColumn}
                />
              }
              template={(x: TableDataItem) => x.space.capacity ? formatMetricNumber(x.space.capacity) : <em>N/A</em>}
            />
            <ListViewColumnSpacer />

            {/* VISITS */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.ENTRANCES ? (
              <Fragment>
                <ListViewColumn
                  id="Max"
                  align="right"
                  width={110}
                  title={
                    <Header
                      label="Max"
                      value={formatMetricNumber(Math.max(...tableData.map(x => x.metricData.count.max.value)))}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  valueTemplate={(x: TableDataItem) => x.metricData.count.max.value}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.max.value)}
                />
                <ListViewColumn
                  id="Average"
                  align="right"
                  width={110}
                  title={
                    <Header
                      label="Average"
                      value={formatMetricNumber(tableData.map(x => x.metricData.entrances.average).reduce(sum) / tableData.length)}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  valueTemplate={(x: TableDataItem) => x.metricData.entrances.average}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.entrances.average)}
                />
                <ListViewColumn
                  id="Total"
                  width={110}
                  align="right"
                  title={
                    <Header
                      label="Total"
                      value={formatMetricNumber(tableData.map(x => x.metricData.entrances.total).reduce(sum))}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  valueTemplate={(x: TableDataItem) => x.metricData.entrances.total}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.entrances.total)}
                />
              </Fragment>
            ) : null}

            {/* COUNT */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.MAX ? (
              <Fragment>
                <ListViewColumn
                  id="Max"
                  align="right"
                  width={110}
                  title={
                    <Header
                      label="Max"
                      value={formatMetricNumber(Math.max(...tableData.map(x => x.metricData.count.max.value)))}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  valueTemplate={(x: TableDataItem) => x.metricData.count.max.value}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.max.value)}
                />
                <ListViewColumn
                  id="Average"
                  align="right"
                  width={110}
                  title={
                    <Header
                      label="Average"
                      value={formatMetricNumber(tableData.map(x => x.metricData.count.average).reduce(sum) / tableData.length)}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  valueTemplate={(x: TableDataItem) => x.metricData.count.average}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.average)}
                />
              </Fragment>
            ) : null}

            {/* UTILIZATION */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.UTILIZATION ? (
              <Fragment>
                <ListViewColumn
                  id="Max"
                  title={
                    <Header
                      label="Max"
                      value={<Fragment>
                        {formatMetricNumber(Math.max(...tableData.map(x => x.metricData.targetUtilization.max.value)))}%
                      </Fragment>}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  width={130}
                  align="right"
                  valueTemplate={(x: TableDataItem) => x.metricData.targetUtilization.max.value}
                  template={(x: TableDataItem) => <span>{formatMetricNumber((x.metricData.targetUtilization.max || {}).value)}%</span>}
                />
                <ListViewColumn
                  id="Average"
                  title={
                    <Header
                      label="Average"
                      value={<Fragment>
                        {formatMetricNumber(tableData.map(x => x.metricData.targetUtilization.average).reduce(sum) / tableData.length)}%
                      </Fragment>}
                      spaceSortDirection={spaceSortDirection}
                      spaceSortColumn={spaceSortColumn}
                      right
                    />
                  }
                  align="right"
                  width={130}
                  valueTemplate={(x: TableDataItem) => x.metricData.targetUtilization.average}
                  template={(x: TableDataItem) => <Fragment>{formatMetricNumber(x.metricData.targetUtilization.average)}%</Fragment>}
                />
              </Fragment>
            ) : null}
          </ListView>
        </div>
        {/* .tableView */}
      </div>
      {/* .spacesDataTable */}
    </div>
  );
}
