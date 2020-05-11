import { Moment } from 'moment';
import { of, from, merge, combineLatest } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';

import core from '../../client/core';
import createRxStore, { rxDispatch, actions } from '..';
import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import {
  DensityReport,
} from '../../types';
import { TimeFilter } from '../../types/datetime';
import { AnalyticsActionType } from '../../rx-actions/analytics';
import { ResourceStatus } from '../../types/resource';
import {
  AnalyticsMetrics,
  AnalyticsState,
  AnalyticsFocusedMetric,
  QueryInterval,
  StoredAnalyticsReport,
} from '../../types/analytics';
import fetchAllObjects from '../../helpers/fetch-all-objects';

import collectionSpacesError from '../../rx-actions/collection/spaces-legacy/error';
import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import UserStore from '../user';
import SpacesLegacyStore from '../spaces-legacy';
import SpaceHierarchyStore from '../space-hierarchy';
import { registerSideEffects } from './effects';
import { serializeTimeFilter } from '../../helpers/datetime-utilities';
import { SpacesCountsAPIResponse, SpacesCountsMetricsAPIResponse } from '../../types/api';
import { computeTableData } from '../../helpers/analytics-table';
import { computeChartData } from '../../helpers/analytics-chart';
import { convertStoredAnalyticsReportToAnalyticsReport } from '../../helpers/analytics-report';
import { ColorManager, COLORS } from '../../helpers/analytics-color-scale';
import createReport from '../../rx-actions/analytics/operations/create-report';
import { getGoSlow } from '../../components/environment-switcher';

import analyticsReducer, { initialState } from './reducer';

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

// ANALYTICS STORE
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
    const response = await core().get<SpacesCountsMetricsAPIResponse>('/spaces/counts/metrics', {
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
