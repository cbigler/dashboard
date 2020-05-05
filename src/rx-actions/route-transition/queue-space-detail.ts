import { QueueActionTypes } from '../../rx-actions/queue';

export default async function routeTransitionLiveSpaceList(dispatch, id) {
  dispatch({ type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL, id });
}