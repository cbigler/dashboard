import integrationServicesList from '../integrations/services';
import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsServiceFailure(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
  showToast(dispatch, {
    text: 'There was an issue connecting with the 3rd party service. Please try again or contact support.',
    type: 'error',
  });

  // fetch list of all integrations
  integrationServicesList(dispatch);
}