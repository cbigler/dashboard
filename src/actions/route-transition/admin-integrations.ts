import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import core from '../../client/core';

import integrationServicesList from '../integrations/services';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default function routeTransitionAdminIntegrations() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS })

    // fetch list of all integrations
    dispatch(integrationServicesList());
  }
}
