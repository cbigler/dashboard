import collectionTokensSet from '../collection/tokens/set';
import collectionWebhooksSet from '../collection/webhooks/set';
import accounts from '../../client/accounts';
import core from '../../client/core';

export const ROUTE_TRANSITION_ADMIN_DEVELOPER = 'ROUTE_TRANSITION_ADMIN_DEVELOPER';

export default async function routeTransitionAdminDeveloper(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVELOPER });

  // Fetch all tokens and webhooks.
  await Promise.all([
    accounts().get('/tokens').then(response => {
      dispatch(collectionTokensSet(response.data));
    }),
    core().get('/webhooks').then(response => {
      dispatch(collectionWebhooksSet(response.data.results));
    })
  ]);
}
