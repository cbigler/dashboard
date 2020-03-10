import core from '../../client/core';

import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsTeem(dispatch, access_token, expires_in, refresh_token, token_type) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
  
  let errorThrown;
  try {
    await core().post('/integrations/teem/confirm/', {
      access_token: access_token,
      expires_in: expires_in,
      refresh_token: refresh_token,
      token_type: token_type,
    });    
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      text: 'Error setting up integration',
      type: 'error',
    });
  } else {
    showToast(dispatch, { text: 'Integration added!' });
  }

  window.location.hash = '#/admin/integrations';
}
