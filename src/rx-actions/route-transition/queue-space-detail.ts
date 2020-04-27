export const ROUTE_TRANSITION_QUEUE_SPACE_DETAIL = 'ROUTE_TRANSITION_QUEUE_SPACE_DETAIL';

export default async function routeTransitionLiveSpaceList(dispatch, id) {
  console.log(id)
  dispatch({ type: ROUTE_TRANSITION_QUEUE_SPACE_DETAIL });
}