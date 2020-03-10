import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsServiceFailure(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
  showToast(dispatch, {
    text: 'Error setting up integration',
    type: 'error',
  });

  window.location.hash = '#/admin/integrations';
}
