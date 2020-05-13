export const ROUTE_TRANSITION_LOGOUT = 'ROUTE_TRANSITION_LOGOUT';

export default async function routeTransitionLogout(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_LOGOUT });
}
