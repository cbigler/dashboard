import core from '../../client/core';

import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsSlack(dispatch, code) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });

  let errorThrown;
  try {
    await core().get('integrations/slack/auth', { params: { code: code } });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      text: 'Error setting up integration.',
      type: 'error',
    });
  } else {
    showToast(dispatch, { text: 'Integration added!' });
  }

  window.location.hash = '#/admin/integrations';
}
