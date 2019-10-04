import collectionAlertsRead from "../alerts/read";
import collectionSpacesFetchAll from "../collection/spaces/fetch-all";

export const ROUTE_TRANSITION_ACCOUNT = 'ROUTE_TRANSITION_ACCOUNT';

export default async function routeTransitionAccount(dispatch) {
  await collectionAlertsRead(dispatch);
  await collectionSpacesFetchAll(dispatch);
  return dispatch({ type: ROUTE_TRANSITION_ACCOUNT });
}
