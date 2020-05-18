import { skipUpdate } from '..';
import { ResourceStatus, ResourceComplete, RESOURCE_IDLE, RESOURCE_LOADING } from '../../types/resource';
import { AnalyticsState, AnalyticsStateRaw, AnalyticsReport } from '../../types/analytics';
import { GlobalAction } from '../../types/rx-actions';
import { getDefaultColumnSortForMetric } from '../../helpers/analytics-table';
import { AnalyticsActionType } from '../../rx-actions/analytics';

// A helper to allow the reducer to update the state of an individual report easily.
function updateReport(
  state: ResourceComplete<AnalyticsStateRaw>,
  reportId: AnalyticsReport["id"] | null,
  callback: (input: AnalyticsReport) => AnalyticsReport,
) {
  const reportIndex = state.data.reports.findIndex(report => report.id === reportId);
  if (reportIndex >= 0) {
    const newReports = state.data.reports.slice();
    newReports[reportIndex] = callback(newReports[reportIndex]);
    return { ...state, data: { ...state.data, reports: newReports }};
  } else {
    return state;
  }
}

export const initialState = RESOURCE_IDLE;

export default function analyticsReducer(state: AnalyticsState, action: GlobalAction): AnalyticsState | typeof skipUpdate {
  // ----------------------------------------------------------------------------
  // ACTIONS THAT WORK ALWAYS
  // ----------------------------------------------------------------------------
  switch (action.type) {

  case AnalyticsActionType.ANALYTICS_RESOURCE_LOADING:
    return { status: ResourceStatus.LOADING };

  case AnalyticsActionType.ANALYTICS_RESOURCE_COMPLETE:
    return {
      status: ResourceStatus.COMPLETE,
      data: {
        reports: action.data,
        activeReportId: action.activeReportId,
      },
    };

  case AnalyticsActionType.ANALYTICS_RESOURCE_ERROR:
    return { status: ResourceStatus.ERROR, error: action.error };
  }

  if (state.status !== ResourceStatus.COMPLETE) {
    return skipUpdate;
  }

  // ----------------------------------------------------------------------------
  // ACTIONS THAT ONLY WORK WHEN THE RESOURCE IS LOADED
  // ----------------------------------------------------------------------------
  switch (action.type) {

  // FIXME: this report open flow is very confusing and probably has a lot of little hidden bugs
  case AnalyticsActionType.ANALYTICS_OPEN_REPORT: {
    const reportIsInStore = (
      state.data.reports
        .map(r => r.id)
        .includes(action.report.id)
    );

    return {
      ...state,
      data: {
        reports: [
          // Open the report if it's already in the store
          ...state.data.reports.map(r => {
            if (r.id === action.report.id) {
              return {
                ...r,
                columnSort: getDefaultColumnSortForMetric(action.report.selectedMetric),
                isOpen: true,
              };
            } else {
              return r;
            }
          }),
          // If the report isn't in the store, add it and open it
          ...(!reportIsInStore ? [{
            ...action.report,
            columnSort: getDefaultColumnSortForMetric(action.report.selectedMetric),
            isOpen: true
          }] : []),
        ],
        activeReportId: action.report.id,
      },
    };
  }

  case AnalyticsActionType.ANALYTICS_CLOSE_REPORT:
    let newActiveReportId: string | null = null;
    const newOpenReports = state.data.reports.filter(r => r.isOpen && r.id !== action.reportId);

    // Determine which report should be switched to when a given report is closed.
    if (newOpenReports.length === 0) {
      newActiveReportId = null;
    } else if (newOpenReports.length === 1) {
      newActiveReportId = newOpenReports[0].id;
    } else {
      const reportIndex = state.data.reports.findIndex(r => r.id === action.reportId);
      let previousReportIndex = reportIndex - 1;
      // Check to ensure the previous report index is within the bounds of the new report list
      if (previousReportIndex < 0) { previousReportIndex = 0; }
      if (previousReportIndex > newOpenReports.length-1) { previousReportIndex = newOpenReports.length-1; }
      newActiveReportId = newOpenReports[previousReportIndex].id;
    }

    return {
      ...state,
      data: {
        ...state.data,
        reports: state.data.reports.map(r => {
          if (r.id === action.reportId) {
            return { ...r, isOpen: false };
          } else {
            return r;
          }
        }),
        activeReportId: newActiveReportId
      },
    };

  case AnalyticsActionType.ANALYTICS_FOCUS_REPORT:
    return { ...state, data: { ...state.data, activeReportId: action.reportId } };

  case AnalyticsActionType.ANALYTICS_UPDATE_REPORT:
    return {
      ...state,
      data: {
        ...state.data,
        // If the active report is the report that is being updated, and if `action.report.id` and
        // `action.reportId` are different, then update the active report id to be the new report
        // id.
        activeReportId: state.data.activeReportId === action.reportId ? action.report.id : state.data.activeReportId,
        reports: state.data.reports.map(r => {
          if (r.id === action.reportId) {
            return action.report;
          } else {
            return r;
          }
        }),
      },
    };

  case AnalyticsActionType.ANALYTICS_DELETE_REPORT:
    return {
      ...state,
      data: {
        ...state.data,
        // If the report that is being deleted is the active report, unselect it.
        activeReportId: state.data.activeReportId === action.reportId ? null : state.data.activeReportId,
        reports: state.data.reports.filter(r => r.id !== action.reportId),
      },
    };

  // when the metric is changed, the default sort order for that metric is set
  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTED_METRIC:
    return updateReport(state, action.reportId, report => ({
      ...report,
      selectedMetric: action.metric,
      columnSort: getDefaultColumnSortForMetric(action.metric),
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS:
    return updateReport(state, action.reportId, report => ({
      ...report,
      query: { ...report.query, selections: action.selections },
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_INTERVAL:
    return updateReport(state, action.reportId, report => ({
      ...report,
      query: {
        ...report.query,
        interval: action.interval,
      },
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE:
    return updateReport(state, action.reportId, report => ({
      ...report,
      query: {
        ...report.query,
        dateRange: action.dateRange,
      },
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_TIME_FILTER:
    return updateReport(state, action.reportId, report => ({
      ...report,
      query: {
        ...report.query,
        timeFilter: action.timeFilter,
      },
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES:
    return updateReport(state, action.reportId, report => ({
      ...report,
      hiddenSpaceIds: action.hiddenSpaceIds,
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIGHLIGHTED_SPACE:
    return updateReport(state, action.reportId, report => ({
      ...report,
      highlightedSpaceId: action.highlightedSpaceId,
    }))

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_OPPORTUNITY_PARAMETERS:
    return updateReport(state, action.reportId, report => ({
      ...report,
      opportunityCostPerPerson: action.opportunityCostPerPerson,
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_COLUMN_SORT:
    return updateReport(state, action.reportId, report => ({
      ...report,
      columnSort: {
        column: action.column,
        direction: action.direction,
      },
    }));

  case AnalyticsActionType.ANALYTICS_QUERY_IDLE:
    return updateReport(state, action.reportId, report => ({
      ...report,
      queryResult: RESOURCE_IDLE,
    }));

  case AnalyticsActionType.ANALYTICS_QUERY_LOADING:
    return updateReport(state, action.reportId, report => ({
      ...report,
      queryResult: RESOURCE_LOADING,
    }));

  case AnalyticsActionType.ANALYTICS_QUERY_ERROR:
    return updateReport(state, action.reportId, report => ({
      ...report,
      queryResult: { status: ResourceStatus.ERROR, error: action.error },
    }));

  case AnalyticsActionType.ANALYTICS_QUERY_COMPLETE:
    return updateReport(state, action.reportId, report => {
      return {
        ...report,
        queryResult: {
          status: ResourceStatus.COMPLETE,
          data: {
            selectedSpaceIds: action.selectedSpaceIds,
            datapoints: action.datapoints,
            metrics: action.metrics,
          },
        },
      };
    });

  default:
    return skipUpdate;
  }
}
