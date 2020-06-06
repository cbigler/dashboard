import { Subject, combineLatest, partition, of, merge, from } from 'rxjs';
import { filter, switchMap, take, distinctUntilChanged, map, share, tap, flatMap, catchError } from 'rxjs/operators';

import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { realizeDateRange } from '@density/lib-time-helpers/date-range';

import { DensityReport } from '../../types';
import { GlobalAction } from '../../types/rx-actions';
import { ResourceComplete, ResourceStatus } from '../../types/resource';
import { AnalyticsReport, AnalyticsState, AnalyticsStateRaw, StoredAnalyticsReport } from '../../types/analytics';

import fetchAllObjects from '../../helpers/fetch-all-objects';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import { getBrowserLocalTimeZone } from '../../helpers/space-time-utilities';
import { processAnalyticsChartData } from '../../helpers/analytics-datapoint';
import { processAnalyticsTableData } from '../../helpers/analytics-metrics';
import { exportAnalyticsChartData } from '../../helpers/analytics-data-export/chart';
import { exportAnalyticsTableData } from '../../helpers/analytics-data-export/table';
import {
  runQuery,
  isQueryRunnable,
  realizeSpacesFromQuery,
  convertStoredAnalyticsReportToAnalyticsReport,
  ChartDataFetchingResult,
  TableDataFetchingResult,
} from '../../helpers/analytics-report';

import { AnalyticsActionType } from '../../rx-actions/analytics';

import { StoreSubject } from '..';
import { UserState } from '../user';
import { SpacesLegacyState } from '../spaces-legacy';
import { SpaceHierarchyState } from '../space-hierarchy';

import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpacesError from '../../rx-actions/collection/spaces-legacy/error';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import createReport from '../../rx-actions/analytics/operations/create-report';


// ----------------------------------------------------------------------------
// SIDE EFFECTS FOR QUERY
// ----------------------------------------------------------------------------
export function registerQueryEffects(
  actionStream: Subject<GlobalAction>,
  analyticsStore: StoreSubject<AnalyticsState>,
  userStore: StoreSubject<UserState>,
  spacesStore: StoreSubject<SpacesLegacyState>,
  dispatch: (action: GlobalAction) => void,
  runQueryFunction: typeof runQuery,
) {
  const activeReportUpdates = actionStream.pipe(
    // Filter only the actions that should cause the query to be rerun
    filter(action => {
      switch (action.type) {
        case AnalyticsActionType.ANALYTICS_OPEN_REPORT:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_INTERVAL:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE:
        case AnalyticsActionType.ANALYTICS_REPORT_CHANGE_TIME_FILTER:
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
      return [activeReport as AnalyticsReport, userState as UserState, spacesState as SpacesLegacyState] as const
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
      const userTimeZone = getBrowserLocalTimeZone();
      const { startDate, endDate } = realizeDateRange(
        activeReport.query.dateRange,
        userTimeZone,
        { organizationalWeekStartDay },
      );

      const timeFilter = activeReport.query.timeFilter;

      return {
        startDate,
        endDate,
        timeFilter,
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
        startDate,
        endDate,
        timeFilter,
        activeReport,
        selectedSpaces,
      } = queryContext;

      let chartData: ChartDataFetchingResult;
      let tableData: TableDataFetchingResult;

      try {
        [chartData, tableData] = await runQueryFunction(
          startDate,
          endDate,
          activeReport.query.interval,
          selectedSpaces.map(s => s.id),
          activeReport.selectedMetric,
          timeFilter,
        )
      } catch (error) {
        dispatch({
          type: AnalyticsActionType.ANALYTICS_QUERY_ERROR,
          error,
          reportId: activeReport.id,
        });
        return null;
      }

      return [
        activeReport,
        selectedSpaces,
        chartData,
        tableData,
      ] as const;
    }),
  ).subscribe(args => {
    if (args === null) { return; }

    const [
      activeReport,
      selectedSpaces,
      chartData,
      tableData,
    ] = args;

    const spaceLookup: ReadonlyMap<string, CoreSpace> = (() => {
      const m = new Map();
      selectedSpaces.forEach(space => {
        m.set(space.id, space);
      })
      return m;
    })()

    const datapoints = processAnalyticsChartData(chartData, activeReport.query.interval, activeReport.query.timeFilter, spaceLookup);
    const metrics = processAnalyticsTableData(tableData, datapoints, activeReport.query.interval, spaceLookup);

    dispatch({
      type: AnalyticsActionType.ANALYTICS_QUERY_COMPLETE,
      reportId: activeReport.id,
      datapoints,
      metrics,
      selectedSpaceIds: selectedSpaces.map(i => i.id),
    });
  });

}


// ----------------------------------------------------------------------------
// SIDE EFFECTS FOR ROUTE TRANSITIONS
// ----------------------------------------------------------------------------
export function registerRouteTransitionEffects(
  actionStream: Subject<GlobalAction>,
  analyticsStore: StoreSubject<AnalyticsState>,
  spacesStore: StoreSubject<SpacesLegacyState>,
  spaceHierarchyStore: StoreSubject<SpaceHierarchyState>,
  dispatch: (action: GlobalAction) => void,
) {

  const routeTransitionStream = actionStream.pipe(
    filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
    switchMap(() => combineLatest(
      spacesStore.pipe(take(1)),
      spaceHierarchyStore.pipe(take(1)),
      analyticsStore.pipe(take(1)),
    )),
  );

  const whileInitialDataNotPopulated = () => (source: typeof routeTransitionStream) => source.pipe(
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
    map(spaces => collectionSpacesSet(spaces as Array<CoreSpace>)),
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
  ).subscribe(action => dispatch(action as Any<InAHurry>));
}


// ----------------------------------------------------------------------------
// SIDE EFFECTS FOR PRELOADED-SPACE REPORTS
// ----------------------------------------------------------------------------
export function registerPreloadReportEffects(
  actionStream: Subject<GlobalAction>,
  analyticsStore: StoreSubject<AnalyticsState>,
  dispatch: (action: GlobalAction) => void,
) {
  // Preload a space when analytics is loaded and this key is present in localStorage.
  // TODO: Make this not depend on localStorage!
  actionStream.pipe(
    filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
    switchMap(() => analyticsStore.pipe(
      filter(analyticsState => analyticsState.status === ResourceStatus.COMPLETE),
      take(1),
    )),
  ).subscribe(() => {
    const preload = localStorage.sessionAnalyticsPreload ? JSON.parse(localStorage.sessionAnalyticsPreload) : {};
    if (preload.spaceIds) {
      delete localStorage.sessionAnalyticsPreload;
      createReport(dispatch, preload.spaceIds);
    }
  });
}


// ----------------------------------------------------------------------------
// SIDE EFFECTS FOR EXPORTING DATA
// ----------------------------------------------------------------------------
export function registerExportDataEffects(
  actionStream: Subject<GlobalAction>,
) {
  actionStream.subscribe(action => {
    if (action.type === AnalyticsActionType.ANALYTICS_REQUEST_CHART_DATA_EXPORT) {
      const { datapoints, interval, selectedMetric, hiddenSpaceIds } = action;
      exportAnalyticsChartData(datapoints, interval, selectedMetric, hiddenSpaceIds);
    } else if (action.type === AnalyticsActionType.ANALYTICS_REQUEST_TABLE_DATA_EXPORT) {
      const { report, spaces } = action;
      exportAnalyticsTableData(report, spaces);
    }
  })
}
