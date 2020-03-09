import core from '../../client/core';

import { integrationsActions } from '../../rx-actions/integrations';

export default async function integrationServicesList(dispatch) {
  dispatch(integrationsActions.loadStarted());

  let response;
  try {
    response = await core().get('/integrations/services/');
  } catch (err) {
    dispatch(integrationsActions.loadError('There was an error fetching your integrations - please contact support.'));
    return false;
  }

  dispatch(integrationsActions.loadComplete(response.data));
}
