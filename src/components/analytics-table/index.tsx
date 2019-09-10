import React, { Fragment, useState } from 'react';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceCountMetrics } from '../../types';
import { formatSpaceFunction } from '../../helpers/space-function-choices';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import { ascending, descending } from '../../helpers/natural-sorting';

import {
  ListView,
  ListViewColumn,
  getNextSortDirection,
} from '@density/ui';
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

type SortDirection = 'asc' | 'desc' | 'none';
type SortColumn = string | null;
type SortFunction = (a: any, b: any) => number;

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

export default function AnalyticsTable({
  spaces,
  analyticsReport,

  onChangeHiddenSpaceIds,
}) {
  const [sorting, setSorting] = useState<[SortDirection, SortColumn, SortFunction]>(['none', null, () => 0])
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
            headerHeight={38}
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
                  case 'asc':
                    return (a: TableDataItem, b: TableDataItem) => ascending(template(a), template(b))
                  case 'desc':
                    return (a: TableDataItem, b: TableDataItem) => descending(template(a), template(b))
                  default:
                    return (a:any, b:any) => 0
                }
              })()
              setSorting([sortDirection, column, sortFunction])
            }}
          >
            <ListViewColumn
              id="Name"
              title={
                <span className={styles.tableNameHeader}>
                  <Checkbox
                    checked={allSpacesVisible}
                    onChange={e => onChangeHiddenSpaceIds((e.target as HTMLInputElement).checked ? [] : selectedSpaces.map(i => i.id))}
                  />
                  <span className={styles.tableNameLabel}>Name</span>
                </span>
              }
              onClick={(x: TableDataItem) => changeSpaceVisibility(x.space, !x.isVisible)}
              isRowHeader={true}
              width={240}
              valueTemplate={(x: TableDataItem) => x.space.name}
              template={(x: TableDataItem) => (
                <span
                  className={styles.tableName}
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
                  <span className={styles.tableNameLabel}>{x.space.name}</span>
                </span>
              )}
            />
            <ListViewColumn
              id="Type"
              width={80}
              template={(x: TableDataItem) => formatSpaceType(x.space.spaceType)}
            />
            <ListViewColumn
              id="Function"
              width={180}
              template={(x: TableDataItem) => x.space['function'] ? formatSpaceFunction(x.space['function']) : x.space['function']}
            />

            {/* VISITS */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.ENTRANCES ? (
              <Fragment>
                <ListViewColumn
                  id="Total Visits"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.entrances.total}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.entrances.total)}
                />
                <ListViewColumn
                  id="Avg Visits"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.entrances.average}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.entrances.average)}
                />
                <ListViewColumn
                  id="Peak Visits"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.entrances.peak.value}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.entrances.peak.value)}
                />
              </Fragment>
            ) : null}

            {/* COUNT */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.MAX ? (
              <Fragment>
                <ListViewColumn
                  id="Max Count"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.count.max.value}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.max.value)}
                />
                <ListViewColumn
                  id="Min Count"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.count.min.value}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.min.value)}
                />
                <ListViewColumn
                  id="Avg Count"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.count.average}
                  template={(x: TableDataItem) => formatMetricNumber(x.metricData.count.average)}
                />
              </Fragment>
            ) : null}

            {/* UTILIZATION */}
            {analyticsReport.selectedMetric === AnalyticsFocusedMetric.UTILIZATION ? (
              <Fragment>
                <ListViewColumn
                  id="Max Utilization"
                  width={130}
                  valueTemplate={(x: TableDataItem) => x.metricData.targetUtilization.max.value}
                  template={(x: TableDataItem) => <span>{formatMetricNumber((x.metricData.targetUtilization.max || {}).value)}%</span>} />
                <ListViewColumn
                  id="Min Utilization"
                  width={130}
                  valueTemplate={(x: TableDataItem) => x.metricData.targetUtilization.min.value}
                  template={(x: TableDataItem) => <span>{formatMetricNumber((x.metricData.targetUtilization.min || {}).value)}%</span>} />
                <ListViewColumn
                  id="Avg Utilization"
                  width={130}
                  valueTemplate={(x: TableDataItem) => x.metricData.targetUtilization.average}
                  template={(x: TableDataItem) => <span>{formatMetricNumber(x.metricData.targetUtilization.average)}%</span>} />
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