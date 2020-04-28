import { QueueActionTypes } from '../../rx-actions/queue';

export default async function routeTransitionLiveSpaceList(dispatch, id) {
  dispatch({ type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL, id });
}

// make a store for queue
// fetch spaces / space, store them in the above (ignore all the other spaces store)
// live counting stuff is likely in the legacy spaces store. could use the store for that alone
// precompute the virtual sensor associated with the space, for counting
