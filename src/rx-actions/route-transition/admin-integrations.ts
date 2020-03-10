import {
  integrationsActions,
  servicesList,
} from '../integrations';

export const ROUTE_TRANSITION_ADMIN_INTEGRATIONS = 'ROUTE_TRANSITION_ADMIN_INTEGRATIONS';

export default async function routeTransitionAdminIntegrations(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_INTEGRATIONS })

  // fetch list of all integrations
  dispatch(integrationsActions.loadStarted());
  await servicesList(dispatch);
}
