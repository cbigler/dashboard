import core from '../../client/core';

import integrationServicesList from '../integrations/services';
import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsSlack(dispatch, code) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });

  try {
    await core().get('integrations/slack/auth', { params: { code: code } });
  } catch (err) {
    showToast(dispatch, {
      text: 'Error confirming Slack Integration',
      type: 'error',
    });
    // return false;
  }

  // fetch list of all integrations
  await integrationServicesList(dispatch);
}
