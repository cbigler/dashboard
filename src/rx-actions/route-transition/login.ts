export const ROUTE_TRANSITION_LOGIN = 'ROUTE_TRANSITION_LOGIN';

export default function routeTransitionLogin(redirectAfterLogin) {
  return { type: ROUTE_TRANSITION_LOGIN, redirectAfterLogin };
}
