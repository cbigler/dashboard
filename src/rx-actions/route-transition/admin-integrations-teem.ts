import core from '../../client/core';

import integrationServicesList from '../integrations/services';
import { showToast } from '../../rx-actions/toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrationsTeem(dispatch, access_token, expires_in, refresh_token, token_type) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
  

  try {
    await core().post('/integrations/teem/confirm/', {
      access_token: access_token,
      expires_in: expires_in,
      refresh_token: refresh_token,
      token_type: token_type,
    });    
  } catch (err) {
    showToast(dispatch, {
      text: 'Error confirming Teem Integration',
      type: 'error',
    });
    // return false;
  }
  // fetch list of all integrations
  await integrationServicesList(dispatch);
}