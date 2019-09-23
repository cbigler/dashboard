import {
  DensitySpace,
  DensitySpaceCountMetrics,
  DensitySpaceCountBucketIntervalAnalytics,
  DaysOfWeek,
  DensityReport,
} from '.'

import { DateRange } from '../helpers/space-time-utilities';



export enum AnalyticsActionType {
  ROUTE_TRANSITION_ANALYTICS = 'ROUTE_TRANSITION_ANALYTICS',

  ANALYTICS_RESOURCE_LOADING = 'ANALYTICS_RESOURCE_LOADING',
  ANALYTICS_RESOURCE_COMPLETE = 'ANALYTICS_RESOURCE_COMPLETE',
  ANALYTICS_RESOURCE_ERROR = 'ANALYTICS_RESOURCE_ERROR',

  ANALYTICS_OPEN_REPORT = 'ANALYTICS_OPEN_REPORT',
  ANALYTICS_CLOSE_REPORT = 'ANALYTICS_CLOSE_REPORT',
  ANALYTICS_FOCUS_REPORT = 'ANALYTICS_FOCUS_REPORT',
  ANALYTICS_UPDATE_REPORT = 'ANALYTICS_UPDATE_REPORT',
  ANALYTICS_DELETE_REPORT = 'ANALYTICS_DELETE_REPORT',

  ANALYTICS_REPORT_CHANGE_SELECTED_METRIC = 'ANALYTICS_REPORT_CHANGE_SELECTED_METRIC',
  ANALYTICS_REPORT_CHANGE_SELECTIONS = 'ANALYTICS_REPORT_CHANGE_SELECTIONS',
  ANALYTICS_REPORT_CHANGE_INTERVAL = 'ANALYTICS_REPORT_CHANGE_INTERVAL',
  ANALYTICS_REPORT_CHANGE_DATE_RANGE = 'ANALYTICS_REPORT_CHANGE_DATE_RANGE',
  ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES = 'ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES',
  ANALYTICS_REPORT_REFRESH = 'ANALYTICS_REPORT_REFRESH',

  ANALYTICS_QUERY_IDLE = 'ANALYTICS_QUERY_IDLE',
  ANALYTICS_QUERY_LOADING = 'ANALYTICS_QUERY_LOADING',
  ANALYTICS_QUERY_COMPLETE = 'ANALYTICS_QUERY_COMPLETE',
  ANALYTICS_QUERY_ERROR = 'ANALYTICS_QUERY_ERROR',
};

export type AnalyticsAction = (
  { type: AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS } |

  { type: AnalyticsActionType.ANALYTICS_RESOURCE_LOADING } |
  {
    type: AnalyticsActionType.ANALYTICS_RESOURCE_COMPLETE,
    data: Array<AnalyticsReport>,
    activeReportId: AnalyticsReport["id"] | null,
  } |
  { type: AnalyticsActionType.ANALYTICS_RESOURCE_ERROR, error: any } |

  { type: AnalyticsActionType.ANALYTICS_OPEN_REPORT, report: AnalyticsReport } |
  { type: AnalyticsActionType.ANALYTICS_CLOSE_REPORT, reportId: AnalyticsReport["id"] } |
  { type: AnalyticsActionType.ANALYTICS_FOCUS_REPORT, reportId: AnalyticsReport["id"] | null } |
  { type: AnalyticsActionType.ANALYTICS_UPDATE_REPORT, reportId: AnalyticsReport["id"] | null, report: AnalyticsReport } |
  { type: AnalyticsActionType.ANALYTICS_DELETE_REPORT, reportId: AnalyticsReport["id"] | null } |

  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTED_METRIC,
    reportId: AnalyticsReport["id"],
    metric: AnalyticsFocusedMetric,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
    reportId: AnalyticsReport["id"],
    selections: Array<QuerySelection>,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE,
    reportId: AnalyticsReport["id"],
    dateRange: DateRange,
    organizationalWeekStartDay: DaysOfWeek,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_INTERVAL,
    reportId: AnalyticsReport["id"],
    interval: QueryInterval,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES,
    reportId: AnalyticsReport["id"],
    hiddenSpaceIds: Array<DensitySpace["id"]>,
  } |
  { type: AnalyticsActionType.ANALYTICS_REPORT_REFRESH, reportId: AnalyticsReport["id"] } |

  { type: AnalyticsActionType.ANALYTICS_QUERY_IDLE, reportId: AnalyticsReport["id"] | null } |
  { type: AnalyticsActionType.ANALYTICS_QUERY_LOADING, reportId: AnalyticsReport["id"] | null } |
  {
    type: AnalyticsActionType.ANALYTICS_QUERY_COMPLETE,
    reportId: AnalyticsReport["id"] | null,
    datapoints: Array<AnalyticsDatapoint>,
    metrics: AnalyticsMetrics,
    selectedSpaceIds: Array<DensitySpace["id"]>,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_QUERY_ERROR,
    reportId: AnalyticsReport["id"] | null,
    error: Error | string,
  }
);


export type AnalyticsStateRaw = {
  reports: Array<AnalyticsReport>,
  activeReportId: AnalyticsReport["id"] | null,
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

export enum QueryFilterType { }
// replace 'never' with any new filter type(s) that are needed
export type QueryFilter = never | never

// an example type of Selection (the only one we have so far)
export type SpaceSelection = {
  type: QuerySelectionType.SPACE,
  field: string,
  values: string[]
}

// replace 'never' with any additional new selection type(s)
//   it is here just to indicate the intent of QuerySelection being a union
export type QuerySelection = SpaceSelection | never

export type Query = {
  dateRange: DateRange,
  interval: QueryInterval,
  selections: QuerySelection[],
  filters: QueryFilter[],
};

export type QueryResult = {
  selectedSpaceIds: Array<DensitySpace["id"]>,
  datapoints: Array<AnalyticsDatapoint>,
  metrics: AnalyticsMetrics,
};

export type AnalyticsDatapoint = DensitySpaceCountBucketIntervalAnalytics & {
  spaceId: string,
  spaceName: string,

  // These are the actual unix times in milliseconds
  startActualEpochTime: number,
  endActualEpochTime: number,
  
  // These are some weird hackery to make things render on a single set of local time axes
  startLocalEpochTime: number,
  endLocalEpochTime: number,

  count: number,
} & DensitySpaceCountBucketIntervalAnalytics;

export type AnalyticsMetrics = {
  [spaceId: string]: DensitySpaceCountMetrics,
};

export enum AnalyticsFocusedMetric {
  ENTRANCES = 'entrances',
  MAX = 'max',
  UTILIZATION = 'utilization',
}

export type AnalyticsReport = DensityReport & {
  // FIXME: move query into `settings`! Point this out in a review!
  // I tried to do this, but got a weird type error that made no sense.
  query: Query,

  queryResult: Resource<QueryResult>,
  hiddenSpaceIds: Array<DensitySpace["id"]>,
  selectedMetric: AnalyticsFocusedMetric,
  lastRunTimestamp?: string,
  isSaved: boolean,
  isCurrentlySaving: boolean,
  isOpen: boolean,
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
