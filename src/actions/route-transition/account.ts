import collectionAlertsLoad from "../collection/alerts/load";
import collectionSpacesFetchAll from "../collection/spaces/fetch-all";

export const ROUTE_TRANSITION_ACCOUNT = 'ROUTE_TRANSITION_ACCOUNT';

export default function routeTransitionAccount() {
  return async dispatch => {
    await dispatch(collectionSpacesFetchAll());
    await dispatch(collectionAlertsLoad());
    return dispatch({ type: ROUTE_TRANSITION_ACCOUNT });
  };
}
