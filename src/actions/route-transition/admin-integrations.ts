import integrationServicesList from '../integrations/services';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrations() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS })

    // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}
