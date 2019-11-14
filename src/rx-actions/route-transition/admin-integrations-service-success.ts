import integrationServicesList from '../integrations/services';
import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsServiceSuccess(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
  showToast(dispatch, {
    text: 'Integration added!',
  });

    // fetch list of all integrations
  integrationServicesList(dispatch);
}
