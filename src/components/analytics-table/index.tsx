import React, { Fragment, useState } from 'react';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceRollupMetrics } from '../../types';
import { formatSpaceFunction } from '../../helpers/space-function-choices';
import { DateRange } from '../../helpers/space-time-utilities';
import { AnalyticsInterval } from '../analytics-control-bar-interval-filter';

import {
  ListView,
  ListViewColumn,
  getNextSortDirection,
} from '@density/ui';
import Checkbox from '../checkbox';

type AnalyticsDatapoint = {
  spaceId: string,
  startLocalEpochTime: number,
  endLocalEpochTime: number,
  count: number,
};

type AnalyticsRollups = {
  [spaceId: string]: DensitySpaceRollupMetrics,
};

enum SelectionType {
  SPACE = 'SPACE',
}
interface Selection {
  type: SelectionType
}

enum FilterType { }
interface Filter {
  type: FilterType,
}

// an example type of Selection (the only one we have so far)
interface SpaceSelection extends Selection {
  type: SelectionType.SPACE,
  field: string,
  values: string[]
}

type Query = {
  timeframe: DateRange,
  granularity: AnalyticsInterval,
  selections: Selection[],
  filters: Filter[],
};

type QueryResult = {
  selectedSpaceIds: Array<DensitySpace["id"]>,
  datapoints: Array<AnalyticsDatapoint>,
  rollups: AnalyticsRollups,
};

export enum AnalyticsMetric {
  ENTRANCES = 'ENTRANCES',
  MAX = 'MAX',
  UTILIZATION = 'UTILIZATION',
}

type AnalyticsReport = {
  // TODO: I think this sould eventually be based off of a DensityReport, and `query` should be a
  // field in a DensityReport too. But I don't think we should do that until we know exactly what
  // the `type` / `settings` fields will look like in this if these are going to be reports.
  id: string,
  name: string,
  // type
  // settings
  // creatorEmail
  // dashboardCount
  query: Query, // When in a DensityReport, this will need to be optional

  queryResult: {
    status: 'IDLE' | 'LOADING' | 'COMPLETE' | 'ERROR',
    result: QueryResult
    error?: Error,
  },
  hiddenSpaceIds: Array<DensitySpace["id"]>,
  selectedMetric: AnalyticsMetric,
  lastRunTimestamp?: string,
};

type TableDataItem = {
  space: DensitySpace,
  isVisible: boolean,
  metricData: DensitySpaceRollupMetrics,
};

type SortDirection = 'asc' | 'desc' | 'none';
type SortColumn = string | null;
type SortFunction = (a:any, b:any) => number;


// FIXME: Rename to AnalyticsColorScale and move to helpers
function colorScale(spaceId: DensitySpace["id"]) {
  // FIXME: Colors are not yet defined, please point this out in a review!
  return '#ff0000';
}

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

// FIXME: move to sort helpers
const isMissing = (value: any) => {
  // null or undefined
  if (value == null) {
    return true;
  }
  // empty string
  if (value === '') {
    return true;
  }
  // NaN
  if (typeof value === 'number' && isNaN(value)) {
    return true;
  }
  return false;
}

// Both of these functions sort missing values last, then apply natural sort order to remaining values
// FIXME: move to sort helpers
export function ascending(a: any, b: any) {
  if (isMissing(b)) {
    return isMissing(a) ? 0 : -1;
  }
  if (isMissing(a)) {
    return 1;
  }
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else if (a >= b) {
    return 0;
  } else {
    return NaN;
  }
}

// FIXME: move to sort helpers
export function descending(a: any, b: any) {
  if (isMissing(b)) {
    return isMissing(a) ? 0 : -1;
  }
  if (isMissing(a)) {
    return 1;
  }
  if (b < a) {
    return -1;
  } else if (b > a) {
    return 1;
  } else if (b >= a) {
    return 0;
  } else {
    return NaN;
  }
}


export default function AnalyticsTable({
  spaces,
  analyticsReport,

  onChangeHiddenSpaceIds,
}) {
  const [sorting, setSorting] = useState<[SortDirection, SortColumn, SortFunction]>(['none', null, () => 0])
  const [spaceSortDirection, spaceSortColumn, spaceSortFunction] = sorting;

  const selectedSpaces: Array<DensitySpace> = analyticsReport.queryResult.selectedSpaceIds
    .map(id => spaces.find(space => space.id === id))
    .filter(space => Boolean(space))

  const tableData: Array<TableDataItem> = selectedSpaces.map(space => ({
    space,
    isVisible: !analyticsReport.hiddenSpaceIds.includes(space.id),
    metricData: analyticsReport.queryResult.rollups[space.id],
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
                  style={{ color: colorScale(x.space.id) }}
                >
                  <Checkbox
                    checked={x.isVisible}
                    color={colorScale(x.space.id)}
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
            {analyticsReport.selectedMetric === AnalyticsMetric.ENTRANCES ? (
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
                  template={(x: TableDataItem) => <span>
                    {formatMetricNumber(x.metricData.entrances.peak.value)} {/*<span className={styles.tableMetricMeta}>@ {formatMetricDate(x.metricData.entrances.peak.timestamp)}</span>*/}
                  </span>}
                />
              </Fragment>
            ) : null}

            {/* COUNT */}
            {analyticsReport.selectedMetric === AnalyticsMetric.MAX ? (
              <Fragment>
                <ListViewColumn
                  id="Max Count"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.count.max.value}
                  template={(x: TableDataItem) => <span>
                    {formatMetricNumber(x.metricData.count.max.value)} {/*<span className={styles.tableMetricMeta}>@ {formatMetricDate(x.metricData.count.max.timestamp)}</span>*/}
                  </span>}
                />
                <ListViewColumn
                  id="Min Count"
                  width={110}
                  valueTemplate={(x: TableDataItem) => x.metricData.count.min.value}
                  template={(x: TableDataItem) => <span>
                    {formatMetricNumber(x.metricData.count.min.value)} {/*<span className={styles.tableMetricMeta}>@ {formatMetricDate(x.metricData.count.min.timestamp)}</span>*/}
                  </span>}
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
            {analyticsReport.selectedMetric === AnalyticsMetric.UTILIZATION ? (
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
