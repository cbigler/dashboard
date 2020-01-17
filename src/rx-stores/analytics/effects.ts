import { Subject, combineLatest, partition } from 'rxjs';
import { filter, switchMap, take, distinctUntilChanged, map, share, tap, flatMap } from 'rxjs/operators'

import { StoreSubject } from '../../rx-stores'
import { GlobalAction } from '../../types/rx-actions'
import { ResourceComplete, ResourceStatus } from '../../types/resource';
import {
  AnalyticsReport,
  AnalyticsState,
  AnalyticsStateRaw,
} from '../../types/analytics';
import { AnalyticsActionType } from '../../rx-actions/analytics';
import { UserState } from '../../rx-stores/user';
import { SpacesState } from '../spaces';
import { isQueryRunnable, realizeSpacesFromQuery, ChartDataFetchingResult, TableDataFetchingResult } from '.';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import { realizeDateRange, getBrowserLocalTimeZone } from '../../helpers/space-time-utilities';
import { runQuery } from '.';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { processAnalyticsChartData } from '../../helpers/analytics-datapoint';
import { processAnalyticsTableData } from '../../helpers/analytics-metrics';
import { exportAnalyticsChartData } from '../../helpers/analytics-data-export/chart';
import { exportAnalyticsTableData } from '../../helpers/analytics-data-export/table';


type RunQueryFunction = typeof runQuery;

// trying out this pattern for dependency injection
export function registerSideEffects(
  actionStream: Subject<GlobalAction>,
  analyticsStore: StoreSubject<AnalyticsState>,
  userStore: StoreSubject<UserState>,
  spacesStore: StoreSubject<SpacesState>,
  dispatch: (action: GlobalAction) => void,
  runQuery: RunQueryFunction,
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
        [chartData, tableData] = await runQuery(
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
