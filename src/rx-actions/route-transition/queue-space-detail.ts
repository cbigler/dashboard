import { QueueActionTypes } from '../../rx-actions/queue';

export default async function routeTransitionLiveSpaceList(dispatch, id, queryParams={token: undefined}) {
  dispatch({
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL,
    id,
    queryParams,
  });
}
