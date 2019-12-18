import {
  DensitySpace,
  DensitySpaceCountMetrics,
  DensityReport,
  DensitySpaceTypes,
  DensitySpaceFunction,
} from '.'

import { DateRange } from '../helpers/space-time-utilities';
import { TimeFilter } from './datetime';


export type AnalyticsStateRaw = {
  reports: Array<AnalyticsReport>,
  activeReportId: AnalyticsReport['id'] | null,
};
export type AnalyticsState = Resource<AnalyticsStateRaw>;

export enum QueryInterval {
  ONE_WEEK = '1w',
  ONE_DAY = '1d',
  ONE_HOUR = '1h',
  FIFTEEN_MINUTES = '15m',
  FIVE_MINUTES = '5m',
}

export enum QuerySelectionType {
  SPACE = 'SPACE',
}
export type QuerySelection = SpaceSelection | never

export type SpaceSelection = {
  type: QuerySelectionType.SPACE,
  field: 'space_type',
  values: DensitySpaceTypes[],
} | {
  type: QuerySelectionType.SPACE,
  field: 'function',
  values: DensitySpaceFunction[],
} | {
  type: QuerySelectionType.SPACE,
  field: 'id',
  values: string[],
}

export type Query = {
  dateRange: DateRange,
  interval: QueryInterval,
  selections: QuerySelection[],
};

export type SpaceCountQuery = {
  dateRange: DateRange,
  timeFilter?: TimeFilter,
  interval: QueryInterval,
  selections: SpaceSelection[],
}

export type QueryResult = {
  selectedSpaceIds: Array<DensitySpace["id"]>,
  datapoints: Array<AnalyticsDatapoint>,
  metrics: AnalyticsMetrics,
};

export type AnalyticsDatapoint = {
  spaceId: string,
  spaceName: string,
  millisecondsSinceUnixEpoch: number,
  timeZone: string,
  localDay: string,
  localTime: string,
  localBucketDay: string,
  localBucketTime: string,

  min: number,
  max: number,
  entrances: number,
  exits: number,
  events: number,

  utilization: number | null,
  targetUtilization: number | null,

  // targetCapacity - max
  opportunity: number | null,
};

export type AnalyticsMetrics = {
  // FIXME: hacking this for right now to avoid redefining this huge type just for a single snake_case change
  [spaceId: string]: Omit<DensitySpaceCountMetrics, 'target_utilization'> & {
    target_utilization: DensitySpaceCountMetrics['target_utilization'],
    
    // computed metrics
    peakOpportunity: number | null,
    averageOpportunity: number | null,
    // normalizedOpportunity: number | null,
  }
} | AnalyticsMetricsEmpty;

export type AnalyticsMetricsEmpty = {
  [spaceId: string]: {}
}

export enum AnalyticsFocusedMetric {
  ENTRANCES = 'entrances',
  EXITS = 'exits',
  EVENTS = 'events',
  MAX = 'max', // max occupancy/count
  UTILIZATION = 'utilization',
  OPPORTUNITY = 'opportunity',
}

export enum AnalyticsMetricOpportunityUnit {
  PERSONS = 'persons',
  COST = 'cost',
}

export type AnalyticsReport = {
  id: string,
  name: string,
  creatorEmail?: string,
  query: SpaceCountQuery,
  queryResult: Resource<QueryResult>,
  columnSort: TableColumnSort,
  hiddenSpaceIds: Array<DensitySpace['id']>,
  highlightedSpaceId: string | null,
  selectedMetric: AnalyticsFocusedMetric,
  opportunityCostPerPerson: number,
  lastRunTimestamp?: string,
  isSaved: boolean,
  isCurrentlySaving: boolean,
  isOpen: boolean,
}

export type AnalyticsReportUnsaved = AnalyticsReport & {
  isSaved: false,
  name: 'Untitled Report',
}

export type AnalyticsReportSaved = AnalyticsReport & {
  isSaved: true,
  name: string,
  creatorEmail: string,
}

export type StoredAnalyticsReport = Omit<DensityReport, 'type' | 'settings'> & {
  type: 'LINE_CHART',
  settings: {
    query: SpaceCountQuery,
    selectedMetric: AnalyticsFocusedMetric,
    opportunityCostPerPerson: number,
  },
};

export enum SortDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
  NONE = 'none',
}

export function nextSortDirection(sortDirection: SortDirection) {
  switch (sortDirection) {
    case SortDirection.NONE:
      return SortDirection.DESCENDING;
    case SortDirection.DESCENDING:
      return SortDirection.ASCENDING;
    case SortDirection.ASCENDING:
      return SortDirection.NONE;
  }
}

export type TableColumnSort = {
  column: string | null,
  direction: SortDirection,
}

export enum TableColumn {
  SPACE_NAME = 'Space',
  SPACE_LOCATION = 'Location',
  SPACE_TYPE = 'Type',
  SPACE_FUNCTION = 'Function',
  SPACE_CAPACITY = 'Capacity',
  METRIC_PEAK_OCCUPANCY = 'Peak Occupancy',
  METRIC_AVERAGE_OCCUPANCY = 'Avg. Occupancy',
  METRIC_PEAK_UTILIZATION = 'Peak Utilization',
  METRIC_AVERAGE_UTILIZATION = 'Avg. Utilization',
  METRIC_MAXIMUM_ENTRANCES = 'Max. Entrances',
  METRIC_AVERAGE_ENTRANCES = 'Avg. Entrances',
  METRIC_TOTAL_ENTRANCES = 'Total Entrances',
  METRIC_MAXIMUM_EXITS = 'Max. Exits',
  METRIC_AVERAGE_EXITS = 'Avg. Exits',
  METRIC_TOTAL_EXITS = 'Total Exits',
  METRIC_MAXIMUM_EVENTS = 'Max. Events',
  METRIC_AVERAGE_EVENTS = 'Avg. Events',
  METRIC_TOTAL_EVENTS = 'Total Events',
  METRIC_OPPORTUNITY = 'Min. Avail. Capacity',
  METRIC_AVERAGE_OPPORTUNITY = 'Max Avail. Capacity',
  METRIC_OPPORTUNITY_COST = 'Min. Monthly Pot. Savings',
  METRIC_AVERAGE_OPPORTUNITY_COST = 'Max Monthly Pot. Savings',
}

export enum AnalyticsDataExportType {
  TIME_SERIES = 'Time-series',
  SUMMARY = 'Summary',
  BOTH = 'Both',
}

// REVIEW: should typings for Resource be somewhere else?
export enum ResourceStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export type ResourceIdle = { status: ResourceStatus.IDLE };
export type ResourceLoading = { status: ResourceStatus.LOADING };
export type ResourceComplete<T> = {
  status: ResourceStatus.COMPLETE,
  data: T,
};
export type ResourceError = {
  status: ResourceStatus.ERROR,
  error: any,
};

export type Resource<T> = ResourceIdle | ResourceLoading | ResourceComplete<T> | ResourceError;

export const RESOURCE_IDLE: ResourceIdle = { status: ResourceStatus.IDLE };
export const RESOURCE_LOADING: ResourceLoading = { status: ResourceStatus.LOADING };
