import core from '../../client/core';

import integrationServicesList from '../integrations/services';
import showToast from '../toasts/index';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrationsSlack(code) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });

    try {
      await core().get('integrations/slack/auth', { params: { code: code } });
    } catch (err) {
      dispatch(showToast({
        text: 'Error confirming Slack Integration',
        type: 'error',
      }));
      return false;
    }

    // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}
