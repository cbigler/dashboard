import { Observable, of, from, merge, combineLatest } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import createRxStore, { rxDispatch, actions, skipUpdate, RxReduxStore, ReduxState } from './index';
import { DensitySpace, DensitySpaceHierarchyItem } from '../types';
import {
  AnalyticsState,
  AnalyticsStateRaw,
  AnalyticsActionType,

  ResourceStatus,
  RESOURCE_IDLE,
} from '../types/analytics';
import fetchAllObjects from '../helpers/fetch-all-objects';

import collectionSpacesError from '../actions/collection/spaces/error';
import collectionSpacesSet from '../actions/collection/spaces/set';
import collectionSpaceHierarchySet from '../actions/collection/space-hierarchy/set';

const initialState = RESOURCE_IDLE;

const AnalyticsStore = createRxStore<AnalyticsState>('AnalyticsStore', initialState, (state, action) => {
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

  case AnalyticsActionType.ANALYTICS_OPEN_REPORT:
    return {
      ...state,
      data: {
        reports: [ ...state.data.reports, action.report ],
        activeReportId: action.report.id,
      },
    };

  case AnalyticsActionType.ANALYTICS_CLOSE_REPORT:
    let newActiveReportId: string | null = null;
    const newReports = state.data.reports.filter(r => r.id !== action.reportId);

    // Determine which report should be switched to when a given report is closed.
    if (newReports.length === 0) {
      newActiveReportId = null;
    } else if (newReports.length === 1) {
      newActiveReportId = newReports[0].id;
    } else {
      const reportIndex = state.data.reports.findIndex(r => r.id === action.reportId);
      let previousReportIndex = reportIndex - 1;
      // Check to ensure the previous report index is within the bounds of the new report list
      if (previousReportIndex < 0) { previousReportIndex = 0; }
      if (previousReportIndex > newReports.length-1) { previousReportIndex = newReports.length-1; }
      newActiveReportId = newReports[previousReportIndex].id;
    }

    return {
      ...state,
      data: { ...state.data, reports: newReports, activeReportId: newActiveReportId },
    };

  case AnalyticsActionType.ANALYTICS_FOCUS_REPORT:
    return { ...state, data: { ...state.data, activeReportId: action.reportId } };

  default:
    return skipUpdate;
  }
});
export default AnalyticsStore;

const routeTransitionStream = actions.pipe(
  filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
  switchMap(() => RxReduxStore.pipe(take(1))),
);

const loadSpaces = () => (source: Observable<ReduxState>) => source.pipe(
  switchMap(reduxState => {
    if (reduxState.spaces.view !== 'VISIBLE' && reduxState.spaces.data.length > 1) {
      return of();
    } else {
      return fetchAllObjects<DensitySpace>('/spaces');
    }
  }),
  map(spaces => collectionSpacesSet(spaces)),
  catchError(error => of(collectionSpacesError(error))),
);

const loadSpaceHierarchy = () => (source: Observable<ReduxState>) => source.pipe(
  switchMap(reduxState => {
    if (reduxState.spaceHierarchy.view !== 'VISIBLE' && reduxState.spaceHierarchy.data.length > 1) {
      return of();
    } else {
      return fetchAllObjects<Array<DensitySpaceHierarchyItem>>('/spaces/hierarchy');
    }
  }),
  map(spaces => collectionSpaceHierarchySet(spaces)),
  catchError(error => of(collectionSpacesError(error))),
);

merge(
  routeTransitionStream.pipe(
    loadSpaces(),
  ),
  routeTransitionStream.pipe(
    loadSpaceHierarchy(),
  ),
).subscribe(action => rxDispatch(action));
