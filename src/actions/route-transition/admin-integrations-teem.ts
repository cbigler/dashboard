import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import core from '../../client/core';

import integrationServicesList from '../integrations/services';
import showToast from '../toasts';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrationsTeem(access_token, expires_in, refresh_token, token_type) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });
    

    try {
      const response = await core().post('/integrations/teem/confirm/', {
        access_token: access_token,
        expires_in: expires_in,
        refresh_token: refresh_token,
        token_type: token_type,
      });    
    } catch (err) {
      dispatch(showToast({
        text: 'Error confirming Teem Integration',
        type: 'error',
      }));
      return false;
    }
     // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}