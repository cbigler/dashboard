import { accounts, core } from '../../client';
import collectionTokensSet from '../collection/tokens/set';
import collectionWebhooksSet from '../collection/webhooks/set';

export const ROUTE_TRANSITION_ADMIN_DEVELOPER = 'ROUTE_TRANSITION_ADMIN_DEVELOPER';

export default function routeTransitionAdminDeveloper() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVELOPER });

    // Fetch all tokens and webhooks.
    return Promise.all([
      accounts.tokens.list().then(tokens => {
        dispatch(collectionTokensSet(tokens));
      }),
      core.webhooks.list().then(webhooks => {
        dispatch(collectionWebhooksSet(webhooks.results));
      })
    ]);
  };
}
