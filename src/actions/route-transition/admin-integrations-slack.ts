import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import core from '../../client/core';

import integrationServicesList from '../integrations/services';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrationsSlack(code) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS });

    const response = await core().get('integrations/slack/auth', { params: { code: code } });


    // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}
