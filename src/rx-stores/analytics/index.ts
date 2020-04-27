import { Moment } from 'moment';
import { of, from, merge, combineLatest } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import getInObject from 'lodash/get';

import core from '../../client/core';
import createRxStore, { rxDispatch, actions, skipUpdate } from '..';
import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import {
  DensityReport,
} from '../../types';
import { TimeFilter } from '../../types/datetime';
import { AnalyticsActionType } from '../../rx-actions/analytics';
import { 
  ResourceStatus,
  ResourceComplete,
  RESOURCE_IDLE,
  RESOURCE_LOADING,
} from '../../types/resource';
import {
  AnalyticsState,
  AnalyticsStateRaw,
  AnalyticsReport,
  AnalyticsFocusedMetric,
  SpaceCountQuery,
  QueryInterval,
  QuerySelectionType,
  StoredAnalyticsReport,
  AnalyticsMetrics,
  SortDirection,
} from '../../types/analytics';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DATE_RANGES } from '@density/lib-time-helpers/date-range';

import collectionSpacesError from '../../rx-actions/collection/spaces-legacy/error';
import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import { GlobalAction } from '../../types/rx-actions';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import UserStore from '../user';
import SpacesLegacyStore from '../spaces-legacy';
import SpaceHierarchyStore from '../space-hierarchy';
import { registerSideEffects } from './effects';
import { serializeTimeFilter } from '../../helpers/datetime-utilities';
import { SpacesCountsAPIResponse, SpacesCountsMetricsAPIResponse } from '../../types/api';
import { computeTableData, getDefaultColumnSortForMetric } from '../../helpers/analytics-table';
import { computeChartData } from '../../helpers/analytics-chart';
import { ColorManager, COLORS } from '../../helpers/analytics-color-scale';
import createReport from '../../rx-actions/analytics/operations/create-report';
import { getGoSlow } from '../../components/environment-switcher';


export const initialState = RESOURCE_IDLE;

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

function convertStoredAnalyticsReportToAnalyticsReport(
  report: StoredAnalyticsReport,
  opts: { isSaved?: boolean, isOpen?: boolean } = {},
): AnalyticsReport {
  return {
    id: report.id,
    name: report.name,
    creator_email: report.creator_email || '',

    hiddenSpaceIds: [],
    highlightedSpaceId: null,
    columnSort: {
      column: null,
      direction: SortDirection.NONE,
    },

    selectedMetric: report.settings.selectedMetric || AnalyticsFocusedMetric.MAX,

    opportunityCostPerPerson: report.settings.opportunityCostPerPerson || 300,

    isSaved: typeof opts.isSaved !== 'undefined' ? opts.isSaved : true,
    isCurrentlySaving: false,
    isOpen: typeof opts.isOpen !== 'undefined' ? opts.isOpen : false,

    query: report.settings.query || {
      dateRange: DATE_RANGES.LAST_WEEK,
      interval: QueryInterval.ONE_HOUR,
      selections: [],
      filters: [],
    },
    queryResult: { ...RESOURCE_IDLE },
  }
}


export function analyticsReducer(state: AnalyticsState, action: GlobalAction): AnalyticsState | typeof skipUpdate {
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

const AnalyticsStore = createRxStore<AnalyticsState>('AnalyticsStore', initialState, analyticsReducer);
export default AnalyticsStore;

// ----------------------------------------------------------------------------
// ROUTE TRANSITION
// ----------------------------------------------------------------------------

const routeTransitionStream = actions.pipe(
  filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
  switchMap(() => combineLatest(
    SpacesLegacyStore.pipe(take(1)),
    SpaceHierarchyStore.pipe(take(1)),
    AnalyticsStore.pipe(take(1)),
  )),
);

const whileInitialDataNotPopulated = () => source => source.pipe(
  filter(([spacesState, spaceHierarchyState, analyticsState]) => (
    analyticsState.status !== ResourceStatus.COMPLETE
  )),
);

const spacesLoadStream = routeTransitionStream.pipe(
  whileInitialDataNotPopulated(),
  switchMap(([spacesState, spaceHierarchyState, analyticsState]) => {
    if (spacesState.view !== 'VISIBLE' && spacesState.data.length > 1) {
      return of();
    } else {
      return fetchAllObjects<CoreSpace>('/spaces');
    }
  }),
  map(spaces => collectionSpacesSet(spaces)),
);

const spaceHierarchyLoadStream = routeTransitionStream.pipe(
  whileInitialDataNotPopulated(),
  switchMap(([spacesState, spaceHierarchyState, analyticsState]) => {
    if (spaceHierarchyState.view !== 'VISIBLE' && spaceHierarchyState.data.length > 1) {
      return of();
    } else {
      return fetchAllObjects<Array<CoreSpaceHierarchyNode>>('/spaces/hierarchy');
    }
  }),
  map(spaces => collectionSpaceHierarchySet(spaces)),
);

const reportsLoadStream = routeTransitionStream.pipe(
  whileInitialDataNotPopulated(),
  switchMap(([spacesState, spaceHierarchyState, analyticsState]) => {
    return fetchAllObjects<DensityReport>('/reports');
  }),
);

merge(
  routeTransitionStream.pipe(
    whileInitialDataNotPopulated(),
    map(() => ({ type: AnalyticsActionType.ANALYTICS_RESOURCE_LOADING })),
  ),

  // Dispatch actions as data is loaded
  spacesLoadStream.pipe(catchError(e => of())),
  spaceHierarchyLoadStream.pipe(catchError(e => of())),

  // When all resources are done loading, mark the analytics page as done loading
  combineLatest(
    spacesLoadStream,
    spaceHierarchyLoadStream,
    reportsLoadStream,
  ).pipe(
    map(([spaces, hierarchy, reports]) => ({
      type: AnalyticsActionType.ANALYTICS_RESOURCE_COMPLETE,
      data: (
        reports
          .filter(r => r.type === 'LINE_CHART')
          .map((r) => convertStoredAnalyticsReportToAnalyticsReport(r as StoredAnalyticsReport))
      ),
      activeReportId: null,
    })),
    catchError(error => from([
      collectionSpacesError(error),
      { type: AnalyticsActionType.ANALYTICS_RESOURCE_ERROR, error },
    ])),
  ),
).subscribe(action => rxDispatch(action as Any<InAHurry>));

// Some magic to preload a space when analytics is loaded and this key is present in localStorage.
// TODO: Make this less crazy!
actions.pipe(
  filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
  switchMap(() => AnalyticsStore.pipe(
    filter(analyticsState => analyticsState.status === ResourceStatus.COMPLETE),
    take(1),
  )),
).subscribe(() => {
  const preload = localStorage.sessionAnalyticsPreload ? JSON.parse(localStorage.sessionAnalyticsPreload) : {};
  if (preload.spaceIds) {
    delete localStorage.sessionAnalyticsPreload;
    createReport(rxDispatch, preload.spaceIds);
  }
});

// ----------------------------------------------------------------------------
// RUN REPORT QUERY WHEN IT CHANGES
// ----------------------------------------------------------------------------

export function realizeSpacesFromQuery(spaces: Array<CoreSpace>, query: SpaceCountQuery): Array<CoreSpace> {
  return spaces.filter(space => {
    const spaceMatchesQuery = query.selections.some(selection => {
      switch (selection.type) {
      case QuerySelectionType.SPACE: {
        const targetValue = getInObject(space, selection.field);

        // Special case: null space function means "other" :face_palm:
        if (selection.field === 'function' && 
            targetValue === null &&
            (selection.values as Any<FixInRefactor>).includes(null)) return true;
        
        // Other than the special-case null matching "other", falsy value means no match
        if (!targetValue) return false;
        
        // FIXME: I have no idea what's wrong with the below...
        return (selection.values as Any<FixInRefactor>).includes(targetValue);
      }
      default:
        return false;
      }
    });
    return Boolean(spaceMatchesQuery);
  });
}

export function isQueryRunnable(query: SpaceCountQuery): boolean {
  return (
    query.selections.length > 0
  );
}

export type ChartDataFetchingResult = {
  [space_id: string]: Array<{
    start: string,
    end: string,
    analytics: {
      max: number,
      min: number,
      entrances: number,
      exits: number,
      events: number,
      utilization: number | null,
      target_utilization: number | null,
    }
  }>
}

export type TableDataFetchingResult = AnalyticsMetrics;

export async function runQuery(startDate: Moment, endDate: Moment, interval: QueryInterval, selectedSpaceIds: string[], selectedMetric: AnalyticsFocusedMetric, timeFilter?: TimeFilter) {

  let timeFilterString: string;
  if (timeFilter) {
    timeFilterString = serializeTimeFilter(timeFilter);
  } else {
    timeFilterString = '';
  }

  mixpanelTrack('Analytics Run Query', {
    'Start Time': startDate.format(),
    'End Time': endDate.format(),
    'Metric': selectedMetric,
    'Interval': interval,
    'Time Filter': timeFilterString,
    'Space ID List': selectedSpaceIds.join(','),
  });

  // avoid passing the param altogether if the time filter is empty
  const tableRequestTimeFilterParams = timeFilter ? {
    time_filters: timeFilterString
  } : {};
  
  const sharedParams = {
    // NOTE: using this date format to avoid sending up the TZ offset (eg. -04:00)
    //       so that the backend interprets the date in the space's local time
    start_time: startDate.format('YYYY-MM-DDTHH:mm:ss'),
    end_time: endDate.format('YYYY-MM-DDTHH:mm:ss'),
    space_list: selectedSpaceIds.join(','),
    interval: interval,
    page_size: '10000',
    slow: getGoSlow(),
  }

  async function getChartData() {
    const allResponses: SpacesCountsAPIResponse[] = [];
    const client = core();

    // for the chart data, no time filter is used and always use 15m interval
    let response = await client.get<SpacesCountsAPIResponse>('http://pipeline-health.production.density.io:3001/spaces/counts', {
      params: Object.assign({}, sharedParams, {
        interval: '15m',
      })
    })
    // superstitiously making a copy of the response data since we're reusing that variable for each page
    allResponses.push(Object.assign({}, response.data));
    
    while (response.data.next) {
      response = await client.get<SpacesCountsAPIResponse>(response.data.next);
      allResponses.push(Object.assign({}, response.data));
    }

    

    return allResponses.reduce<ChartDataFetchingResult>((output, current) => {
      Object.keys(current.results).forEach(space_id => {
        const buckets = current.results[space_id].map(d => d.interval);
        if (!output[space_id]) {
          output[space_id] = buckets;
        } else {
          output[space_id].push(...buckets)
        }
      })
      return output;
    }, {})

  }

  async function getTableMetrics() {
    const response = await core().get<SpacesCountsMetricsAPIResponse>('http://pipeline-health.production.density.io:3001/spaces/counts', {
      params: Object.assign({}, sharedParams, tableRequestTimeFilterParams)
    })
    return response.data.metrics;
  }
  
  const chartDataPromise = getChartData();
  const tableDataPromise = getTableMetrics();

  return await Promise.all([chartDataPromise, tableDataPromise]);
}

registerSideEffects(actions, AnalyticsStore, UserStore, SpacesLegacyStore, rxDispatch, runQuery);


export const activeReportDataStream = AnalyticsStore.pipe(
  switchMap(
    () => SpacesLegacyStore.pipe(take(1)),
    (analyticsState, spacesState) => {
      if (analyticsState.status !== ResourceStatus.COMPLETE) {
        return null;
      }
      const activeReportId = analyticsState.data.activeReportId;
      if (!activeReportId) {
        return null;
      }
      const report = analyticsState.data.reports.find(r => r.id === activeReportId);
      if (!report) {
        return null;
      }
      if (report.queryResult.status !== ResourceStatus.COMPLETE) return null;

      // make a space lookup map
      const spaceLookup = new Map<string, CoreSpace>();
      spacesState.data.forEach(space => {
        spaceLookup.set(space.id, space);
      })
      
      const selectedSpaces = report.queryResult.data.selectedSpaceIds
        .map(space_id =>  spaceLookup.get(space_id))
        .filter<CoreSpace>((space): space is CoreSpace => space != null);

      const spacesMissingTargetCapacity = selectedSpaces.filter(space => space.target_capacity == null);

      let validDatapoints = report.queryResult.data.datapoints;

      if (report.selectedMetric === AnalyticsFocusedMetric.UTILIZATION || report.selectedMetric === AnalyticsFocusedMetric.OPPORTUNITY) {
        const invalidSpaceIds = spacesMissingTargetCapacity.map(s => s.id)
        validDatapoints = validDatapoints.filter(datapoint => !invalidSpaceIds.includes(datapoint.space_id));
      }
      
      const tableData = computeTableData(
        report.queryResult.data.metrics,
        selectedSpaces,
        report.selectedMetric,
        report.hiddenSpaceIds,
        report.columnSort,
        report.opportunityCostPerPerson,
      );
      const chartData = computeChartData(
        validDatapoints,
        report.query.interval,
        report.selectedMetric,
        report.hiddenSpaceIds,
      );

      
      const spaceOrder = tableData.rows.map(row => row.space_id);
      
      const colorManager = new ColorManager(Array.from(COLORS))
      const colorMap = new Map<string, string>();
      spaceOrder.forEach(space_id => {
        colorMap.set(space_id, colorManager.next())
      })

      return {
        report,
        tableData,
        chartData,
        spaceOrder,
        colorMap,
      };
    }
  ) 
)
