import { CoreSpace, CoreSpaceType, CoreSpaceFunction } from '@density/lib-api-types/core-v2/spaces'; 
import { DensitySpaceCountMetrics, DensityReport } from '.';

import { DateRange } from '@density/lib-time-helpers/date-range';
import { TimeFilter } from './datetime';
import { Resource } from './resource';


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
  values: CoreSpaceType[],
} | {
  type: QuerySelectionType.SPACE,
  field: 'function',
  values: CoreSpaceFunction[],
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
  selectedSpaceIds: Array<CoreSpace["id"]>,
  datapoints: Array<AnalyticsDatapoint>,
  metrics: AnalyticsMetrics,
};

export type AnalyticsDatapoint = {
  space_id: string,
  space_name: string,
  millisecondsSinceUnixEpoch: number,
  time_zone: string,
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
  target_utilization: number | null,

  // target_capacity - max
  opportunity: number | null,
};

export type AnalyticsMetrics = {
  // FIXME: hacking this for right now to avoid redefining this huge type just for a single snake_case change
  [space_id: string]: Omit<DensitySpaceCountMetrics, 'target_utilization'> & {
    target_utilization: DensitySpaceCountMetrics['target_utilization'],
    
    // computed metrics
    peakOpportunity: number | null,
    averageOpportunity: number | null,
    // normalizedOpportunity: number | null,
  }
} | AnalyticsMetricsEmpty;

export type AnalyticsMetricsEmpty = {
  [space_id: string]: {}
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
  creator_email?: string,
  query: SpaceCountQuery,
  queryResult: Resource<QueryResult>,
  columnSort: TableColumnSort,
  hiddenSpaceIds: Array<CoreSpace['id']>,
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
  creator_email: string,
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
