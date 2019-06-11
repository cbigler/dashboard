import integrationServicesList from '../integrations/services';
import showToast from '../toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrationsServiceFailure() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
    dispatch(showToast({
      text: 'There was an issue connecting with the 3rd party service. Please try again or contact support.',
      type: 'error',
    }));

     // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}