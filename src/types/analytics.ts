import {
  DensitySpace,
  DensitySpaceCountMetrics,
  DaysOfWeek,
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

  ANALYTICS_REPORT_CHANGE_SELECTED_METRIC = 'ANALYTICS_REPORT_CHANGE_SELECTED_METRIC',
  ANALYTICS_REPORT_CHANGE_SELECTIONS = 'ANALYTICS_REPORT_CHANGE_SELECTIONS',
  ANALYTICS_REPORT_CHANGE_INTERVAL = 'ANALYTICS_REPORT_CHANGE_INTERVAL',
  ANALYTICS_REPORT_CHANGE_DATE_RANGE = 'ANALYTICS_REPORT_CHANGE_DATE_RANGE',
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
interface QuerySelection {
  type: QuerySelectionType
}

export enum QueryFilterType { }
interface QueryFilter {
  type: QueryFilterType,
}

// an example type of Selection (the only one we have so far)
export interface SpaceSelection extends QuerySelection {
  type: QuerySelectionType.SPACE,
  field: string,
  values: string[]
}

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

export type AnalyticsDatapoint = {
  spaceId: string,
  startLocalEpochTime: number,
  endLocalEpochTime: number,
  count: number,
};

export type AnalyticsMetrics = {
  [spaceId: string]: DensitySpaceCountMetrics,
};

export enum AnalyticsFocusedMetric {
  ENTRANCES = 'entrances',
  MAX = 'max',
  UTILIZATION = 'utilization',
}

export type AnalyticsReport = {
  // TODO: I think this should eventually be based off of a DensityReport, and `query` should be a
  // field in a DensityReport too. But I don't think we should do that until we know exactly what
  // the `type` / `settings` fields will look like in this if these are going to be reports.
  id: string,
  name: string,
  // type
  // settings
  // creatorEmail
  // dashboardCount
  query: Query, // When in a DensityReport, this will need to be optional

  queryResult: Resource<QueryResult>,
  hiddenSpaceIds: Array<DensitySpace["id"]>,
  selectedMetric: AnalyticsFocusedMetric,
  lastRunTimestamp?: string,
  isSaved: boolean,
};

// REVIEW: should typings for Resource be somewhere else?
export enum ResourceStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

type ResourceIdle = { status: ResourceStatus.IDLE };
export const RESOURCE_IDLE: ResourceIdle = { status: ResourceStatus.IDLE };
type ResourceLoading = { status: ResourceStatus.LOADING };
export const RESOURCE_LOADING: ResourceLoading = { status: ResourceStatus.LOADING };
export type ResourceComplete<T> = {
  status: ResourceStatus.COMPLETE,
  data: T,
};
export type ResourceError = {
  status: ResourceStatus.ERROR,
  error: any,
};

export type Resource<T> = ResourceIdle | ResourceLoading | ResourceComplete<T> | ResourceError;
