import {
  DensitySpace,
  DensitySpaceCountMetrics,
  DensitySpaceCountBucketIntervalAnalytics,
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
  localDay: string,
  localTime: string,
  localBucketDay: string,
  localBucketTime: string,
} & DensitySpaceCountBucketIntervalAnalytics;

export type AnalyticsMetrics = {
  // FIXME: hacking this for right now to avoid redefining this huge type just for a single snake_case change
  [spaceId: string]: Omit<DensitySpaceCountMetrics, 'target_utilization'> & {
    target_utilization: DensitySpaceCountMetrics['target_utilization']
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
}

export type AnalyticsReport = {
  id: string,
  name: string,
  creatorEmail?: string,
  query: SpaceCountQuery,
  queryResult: Resource<QueryResult>,
  hiddenSpaceIds: Array<DensitySpace['id']>,
  selectedMetric: AnalyticsFocusedMetric,
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
  },
};

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
