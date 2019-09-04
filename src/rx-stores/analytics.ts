import { Observable, of, merge } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';

import createRxStore, { rxDispatch, actions, skipUpdate, RxReduxStore, ReduxState } from './index';
import { DensitySpace, DensitySpaceHierarchyItem } from '../types';
import { AnalyticsState, AnalyticsActionType } from '../types/analytics';
import fetchAllObjects from '../helpers/fetch-all-objects';

import collectionSpacesError from '../actions/collection/spaces/error';
import collectionSpacesSet from '../actions/collection/spaces/set';
import collectionSpaceHierarchySet from '../actions/collection/space-hierarchy/set';

const AnalyticsStore = createRxStore<AnalyticsState>('AnalyticsStore', {}, (state, action) => skipUpdate);
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
