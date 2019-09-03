import { filter, take, switchMap } from 'rxjs/operators';

import createRxStore, { rxDispatch, actions, skipUpdate } from './index';
import { AnalyticsState, AnalyticsActionType } from '../types/analytics';

const AnalyticsStore = createRxStore<AnalyticsState>('AnalyticsStore', {}, (state, action) => skipUpdate);
export default AnalyticsStore;

actions.pipe(
  filter(action => action.type === AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS),
  switchMap(() => AnalyticsStore.pipe(take(1))),
).subscribe(state => {
  // FIXME: Add route transition logic in here
  console.log('ROUTE TRANSITION LOGIC HERE');
});
