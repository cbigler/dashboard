import collectionAlertsRead from "../../rx-actions/alerts/read";
import collectionSpacesFetchAll from "../collection/spaces/fetch-all";

export const ROUTE_TRANSITION_ACCOUNT = 'ROUTE_TRANSITION_ACCOUNT';

export default function routeTransitionAccount() {
  return async dispatch => {
    await collectionAlertsRead(dispatch);
    await dispatch(collectionSpacesFetchAll());
    return dispatch({ type: ROUTE_TRANSITION_ACCOUNT });
  };
}
