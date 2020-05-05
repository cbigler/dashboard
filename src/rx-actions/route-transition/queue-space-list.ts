import { QueueActionTypes } from '../../rx-actions/queue';

export default async function routeTransitionLiveSpaceList(dispatch) {
  dispatch({ type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_LIST });
}
