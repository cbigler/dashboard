export const ROUTE_TRANSITION_LOGIN_ERROR = 'ROUTE_TRANSITION_LOGIN_ERROR';

export default function routeTransitionLoginError(error) {
  return { type: ROUTE_TRANSITION_LOGIN_ERROR, error };
}
