import integrationServicesList from '../integrations/services';
import showToast from '../toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrationsServiceSuccess() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
    dispatch(showToast({
      text: 'Integration added!',
    }));

     // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}