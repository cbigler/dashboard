import { Moment } from 'moment';
import { of, from, merge, combineLatest } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import changeCase from 'change-case';
import getInObject from 'lodash/get';

import core from '../../client/core';
import createRxStore, { rxDispatch, actions, skipUpdate } from '..';
import {
  DensityReport,
  DensitySpace,
  DensitySpaceHierarchyItem,
} from '../../types';
import { TimeFilter } from '../../types/datetime';
import { AnalyticsActionType } from '../../rx-actions/analytics';
import {
  AnalyticsState,
  AnalyticsStateRaw,
  AnalyticsReport,
  AnalyticsFocusedMetric,
  SpaceCountQuery,
  QueryInterval,
  QuerySelectionType,
  ResourceStatus,
  ResourceComplete,
  RESOURCE_IDLE,
  RESOURCE_LOADING,
  StoredAnalyticsReport,
  AnalyticsMetrics,
} from '../../types/analytics';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DATE_RANGES } from '../../helpers/space-time-utilities';

import collectionSpacesError from '../../rx-actions/collection/spaces/error';
import collectionSpacesSet from '../../rx-actions/collection/spaces/set';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import { GlobalAction } from '../../types/rx-actions';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import UserStore from '../user';
import SpacesStore from '../spaces';
import SpaceHierarchyStore from '../space-hierarchy';
import { registerSideEffects } from './effects';
import { serializeTimeFilter } from '../../helpers/datetime-utilities';
import { SpacesCountsAPIResponse, SpacesCountsMetricsAPIResponse } from '../../types/api';


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
    creatorEmail: report.creatorEmail || '',

    hiddenSpaceIds: [],
    selectedMetric: report.settings.selectedMetric || AnalyticsFocusedMetric.MAX,

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
              return { ...r, isOpen: true };
            } else {
              return r;
            }
          }),
          // If the report isn't in the store, add it and open it
          ...(!reportIsInStore ? [{...action.report, isOpen: true}] : []),
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

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTED_METRIC:
    return updateReport(state, action.reportId, report => ({
      ...report,
      selectedMetric: action.metric,
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
    SpacesStore.pipe(take(1)),
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
      return fetchAllObjects<DensitySpace>('/spaces');
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
      return fetchAllObjects<Array<DensitySpaceHierarchyItem>>('/spaces/hierarchy');
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

// ----------------------------------------------------------------------------
// RUN REPORT QUERY WHEN IT CHANGES
// ----------------------------------------------------------------------------

export function realizeSpacesFromQuery(spaces: Array<DensitySpace>, query: SpaceCountQuery): Array<DensitySpace> {
  return spaces.filter(space => {
    const spaceMatchesQuery = query.selections.some(selection => {
      switch (selection.type) {
      case QuerySelectionType.SPACE: {
        // FIXME: objectSnakeToCamel makes this necessary, and it's confusing
        const targetField = changeCase.camelCase(selection.field) as ('spaceType' | 'function' | 'id');
        const targetValue = getInObject(space, targetField)
        if (!targetValue) return false;
        // FIXME: I have no idea what's wrong with the below...
        // @ts-ignore
        return selection.values.includes(targetValue);
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
  [spaceId: string]: Array<{
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
  }

  async function getChartData() {
    const allResponses: SpacesCountsAPIResponse[] = [];
    const client = core();

    // for the chart data, no time filter is used and always use 15m interval
    let response = await client.get<SpacesCountsAPIResponse>('/spaces/counts', {
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
      Object.keys(current.results).forEach(spaceId => {
        // const buckets = current.results[spaceId].map(d => objectSnakeToCamel<DensitySpaceCountBucketInterval>(d.interval));
        const buckets = current.results[spaceId].map(d => d.interval);
        if (!output[spaceId]) {
          output[spaceId] = buckets;
        } else {
          output[spaceId].push(...buckets)
        }
      })
      return output;
    }, {})

  }

  async function getTableMetrics() {
    const response = await core().get<SpacesCountsMetricsAPIResponse>('/spaces/counts/metrics', {
      params: Object.assign({}, sharedParams, tableRequestTimeFilterParams)
    })
    return response.data.metrics;
  }
  
  const chartDataPromise = getChartData();
  const tableDataPromise = getTableMetrics();

  return await Promise.all([chartDataPromise, tableDataPromise]);
}

registerSideEffects(actions, AnalyticsStore, UserStore, SpacesStore, rxDispatch, runQuery);
