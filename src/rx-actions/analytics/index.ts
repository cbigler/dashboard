import { AnalyticsReport, AnalyticsFocusedMetric, QuerySelection, QueryInterval, AnalyticsDatapoint, AnalyticsMetrics } from "../../types/analytics";
import { DateRange } from "../../helpers/space-time-utilities";
import { DayOfWeek, TimeFilter } from "../../types/datetime";
import { DensitySpace } from "../../types";

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
  ANALYTICS_REPORT_CHANGE_TIME_FILTER = 'ANALYTICS_REPORT_CHANGE_TIME_FILTER',
  ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES = 'ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES',
  ANALYTICS_REPORT_REFRESH = 'ANALYTICS_REPORT_REFRESH',

  ANALYTICS_QUERY_IDLE = 'ANALYTICS_QUERY_IDLE',
  ANALYTICS_QUERY_LOADING = 'ANALYTICS_QUERY_LOADING',
  ANALYTICS_QUERY_COMPLETE = 'ANALYTICS_QUERY_COMPLETE',
  ANALYTICS_QUERY_ERROR = 'ANALYTICS_QUERY_ERROR',
};

export type ANALYTICS_REPORT_SAVE_CLICKED = {
  type: 'ANALYTICS_REPORT_SAVE_CLICKED',  
}

export type AnalyticsAction = (
  ANALYTICS_REPORT_SAVE_CLICKED | 
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
    organizationalWeekStartDay: DayOfWeek,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_TIME_FILTER,
    reportId: AnalyticsReport["id"],
    timeFilter: TimeFilter,
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
    datapoints: AnalyticsDatapoint[],
    metrics: AnalyticsMetrics,
    selectedSpaceIds: Array<DensitySpace["id"]>,
  } |
  {
    type: AnalyticsActionType.ANALYTICS_QUERY_ERROR,
    reportId: AnalyticsReport["id"] | null,
    error: Error | string,
  }
);
