import moment, { Moment } from 'moment';
import { of, from, merge, combineLatest, partition, Subject } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
  tap,
  flatMap,
  share,
  distinctUntilChanged,
} from 'rxjs/operators';
import changeCase from 'change-case';

import core from '../../client/core';
import createRxStore, { rxDispatch, actions, skipUpdate } from '..';
import {
  DensityReport,
  DensitySpace,
  DensitySpaceHierarchyItem,
  DensitySpaceCountBucket,
  DensitySpaceCountMetrics,
  DaysOfWeek,
} from '../../types';
import {
  AnalyticsState,
  AnalyticsStateRaw,
  AnalyticsActionType,
  AnalyticsReport,
  AnalyticsFocusedMetric,
  AnalyticsDatapoint,
  AnalyticsMetrics,
  Query,
  QueryInterval,
  QuerySelectionType,
  SpaceSelection,

  ResourceStatus,
  ResourceComplete,
  RESOURCE_IDLE,
  RESOURCE_LOADING,
} from '../../types/analytics';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DATE_RANGES, DateRange, realizeDateRange } from '../../helpers/space-time-utilities';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { createDatapoint } from '../../helpers/analytics-datapoint';

import collectionSpacesError from '../../rx-actions/collection/spaces/error';
import collectionSpacesSet from '../../rx-actions/collection/spaces/set';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import { StoreSubject } from '..';
import { GlobalAction } from '../../types/rx-actions';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import UserStore, { UserState } from '../user';
import SpacesStore, { SpacesState } from '../spaces';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import SpaceHierarchyStore from '../space-hierarchy';


const USER_TIME_ZONE = moment.tz.guess();

const initialState = RESOURCE_IDLE;

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

function recommendQueryInterval(dateRange: DateRange, organizationalWeekStartDay: DaysOfWeek) {
  const { startDate, endDate } = realizeDateRange(
    dateRange,
    USER_TIME_ZONE,
    { organizationalWeekStartDay },
  );

  const days = endDate.diff(startDate, 'days');
  if (days <= 3) {
    return QueryInterval.FIFTEEN_MINUTES;
  } else if (days <= 10) {
    return QueryInterval.ONE_HOUR;
  } else {
    return QueryInterval.ONE_DAY;
  }
}

// FIXME: move this function somewhere else, point this out in a review!
type ConvertDensityReportToAnalyticsReportOptions = { isSaved?: boolean, isOpen?: boolean };
function convertDensityReportToAnalyticsReport(
  report: DensityReport,
  opts: ConvertDensityReportToAnalyticsReportOptions = {},
): AnalyticsReport {
  return {
    ...report,
    // FIXME: this query needs to somehow come from the density report? Point this out in a review!
    query: report.settings.query || {
      dateRange: DATE_RANGES.LAST_WEEK,
      interval: QueryInterval.ONE_HOUR,
      selections: [],
      filters: [],
    },
    queryResult: RESOURCE_IDLE,
    hiddenSpaceIds: [],
    selectedMetric: AnalyticsFocusedMetric.MAX,
    isSaved: typeof opts.isSaved !== 'undefined' ? opts.isSaved : true,
    isCurrentlySaving: false,
    isOpen: typeof opts.isOpen !== 'undefined' ? opts.isOpen : false,
  };
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
      query: { ...report.query, interval: action.interval },
    }));

  case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE:
    return updateReport(state, action.reportId, report => ({
      ...report,
      query: {
        ...report.query,
        dateRange: action.dateRange,
        interval: recommendQueryInterval(action.dateRange, action.organizationalWeekStartDay),
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
          .map(r => convertDensityReportToAnalyticsReport(r))
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

function realizeSpacesFromQuery(spaces: Array<DensitySpace>, query: Query): Array<DensitySpace> {
  return spaces.filter(space => {
    const spaceMatchesQuery = query.selections.some(selection => {
      switch (selection.type) {
      case QuerySelectionType.SPACE:
        const spaceSelection = selection as SpaceSelection;
        return spaceSelection.values.includes(space[changeCase.camelCase(spaceSelection.field)]);
      default:
        return false;
      }
    });
    return Boolean(spaceMatchesQuery);
  });
}

export function isQueryRunnable(query: Query): boolean {
  return (
    query.selections.length > 0
  );
}

export type QueryDependencies = {
  activeReport: AnalyticsReport,
  startDate: Moment,
  endDate: Moment,
  selectedSpaces: DensitySpace[],
}

async function runQuery(deps: QueryDependencies) {
  const { activeReport, startDate, endDate, selectedSpaces } = deps;

  mixpanelTrack('Analytics Run Query', {
    'Start Time': startDate.format(),
    'End Time': endDate.format(),
    'Metric': activeReport.selectedMetric,
    'Interval': activeReport.query.interval,
    'Space ID List': selectedSpaces.map(s => s.id).join(','),
  });

  return await core().get('/spaces/counts', {
    params: {
      // NOTE: using this date format to avoid sending up the TZ offset (eg. -04:00)
      //       so that the backend interprets the date in the space's local time
      start_time: startDate.format('YYYY-MM-DDTHH:mm:ss'),
      end_time: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      space_list: selectedSpaces.map(s => s.id).join(','),
      interval: activeReport.query.interval,
      page_size: '5000',
    },
  })
}

registerSideEffects(actions, AnalyticsStore, UserStore, SpacesStore, rxDispatch, runQuery);

type RawBatchCountsResponse = Any<FixInRefactor>;

export function registerSideEffects(
  actionStream: Subject<GlobalAction>,
  analyticsStore: StoreSubject<AnalyticsState>,
  userStore: StoreSubject<UserState>,
  spacesStore: StoreSubject<SpacesState>,
  dispatch: (action: GlobalAction) => void,
  runQuery: (deps: QueryDependencies) => Promise<RawBatchCountsResponse>,
) {

  const activeReportUpdates = actionStream.pipe(
    // Filter only the actions that should cause the query to be rerun
    filter(action => {
      switch (action.type) {
        case AnalyticsActionType.ANALYTICS_OPEN_REPORT:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_INTERVAL:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE:
        case AnalyticsActionType.ANALYTICS_REPORT_REFRESH:
          return true;
        default:
          return false;
      }
    }),

    switchMap(() => combineLatest(
      analyticsStore.pipe(take(1)),
      userStore.pipe(take(1)),
      spacesStore.pipe(take(1))
    )),

    filter(([reportsState, userState, spacesState]) => reportsState.status === ResourceStatus.COMPLETE),

    // Extract the activeReport from the store and filter out changes if no active report is selected.
    map(([reportsState, userState, spacesState]) => {
      const reportsStateComplete = reportsState as ResourceComplete<AnalyticsStateRaw>;
      const activeReport: AnalyticsReport | undefined = reportsStateComplete.data.reports.find(
        report => report.id === reportsStateComplete.data.activeReportId
      );
      return [activeReport, userState, spacesState] as const;
    }),
    filter(([activeReport, userState, spacesState]) => typeof activeReport !== 'undefined'),
    map(([activeReport, userState, spacesState]) => {
      return [activeReport as AnalyticsReport, userState as UserState, spacesState as SpacesState] as const
    }),

    // REVIEW: do we need this? what does it do?
    distinctUntilChanged(),
    share(),
  );

  const [activeReportUpdatesValidQuery, activeReportUpdatesInvalidQuery] = partition(
    activeReportUpdates,
    ([activeReport, userState, spacesState]) => isQueryRunnable(activeReport.query),
  );

  // If the query is not able to be run then the ui should indicate this explicitly to the user
  activeReportUpdatesInvalidQuery.subscribe(([activeReport, userState, spacesState]) => {
    // FIXME: I think we should be more explicit about the invalid query than status IDLE
    dispatch({
      type: AnalyticsActionType.ANALYTICS_QUERY_IDLE,
      reportId: activeReport.id,
    });
  });

  activeReportUpdatesValidQuery.pipe(
    map(([activeReport, userState, spacesState]) => {
      const spaces = realizeSpacesFromQuery(
        spacesState.data,
        activeReport.query,
      );

      const organizationalWeekStartDay = getUserDashboardWeekStart(userState);
      const { startDate, endDate } = realizeDateRange(
        activeReport.query.dateRange,
        USER_TIME_ZONE,
        { organizationalWeekStartDay },
      );

      return {
        spacesState,
        startDate,
        endDate,
        activeReport,
        selectedSpaces: spaces,
      };
    }),

    tap(({ activeReport }) => {
      dispatch({
        type: AnalyticsActionType.ANALYTICS_QUERY_LOADING,
        reportId: activeReport.id,
      });
    }),

    flatMap(async queryContext => {
      const {
        spacesState,
        startDate,
        endDate,
        activeReport,
        selectedSpaces,
      } = queryContext;

      let results;
      try {
        results = await runQuery({
          activeReport,
          startDate,
          endDate,
          selectedSpaces,
        });
      } catch (error) {
        dispatch({
          type: AnalyticsActionType.ANALYTICS_QUERY_ERROR,
          error,
          reportId: activeReport.id,
        });
        return null;
      }

      return [activeReport, selectedSpaces, results, spacesState];
    }),
  ).subscribe(args => {
    if (args === null) { return; }

    const activeReport: AnalyticsReport = args[0],
      selectedSpaces: Array<DensitySpace> = args[1],
      response: any = args[2].data,
      spacesState: SpacesState = args[3];

    // Process the space count data for each space and concat them all together
    const datapoints = Object.keys(response.results).reduce((acc, next) => {
      const space = spacesState.data.find(space => space.id === next);
      if (!space) { return acc; }
      const currentBuckets = response.results[next].map(
        bucket => objectSnakeToCamel<DensitySpaceCountBucket>(bucket)
      );
      const localBuckets = currentBuckets.map(c => createDatapoint(c, space))
      return acc.concat(localBuckets);
    }, [] as AnalyticsDatapoint[]);

    const metrics = Object.entries(response.metrics).reduce((acc, next) => {
      const [spaceId, value] = next;
      acc[spaceId] = objectSnakeToCamel<DensitySpaceCountMetrics>(value);
      return acc;
    }, {} as AnalyticsMetrics);

    dispatch({
      type: AnalyticsActionType.ANALYTICS_QUERY_COMPLETE,
      reportId: activeReport.id,
      datapoints,
      metrics,
      selectedSpaceIds: selectedSpaces.map(i => i.id),
    });
  });

}
