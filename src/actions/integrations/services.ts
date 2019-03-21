import core from '../../client/core';

import collectionIntegrationsServicesSet from '../collection/services/set';
import collectionServicesError from '../collection/services/error';

export default function integrationServicesList() {
  return async dispatch => {
    let response;
    try {
      response = await core().get('/integrations/services/')
    }
    catch (err) {
      dispatch(collectionServicesError('Oh shoot, there was an error pulling your integrations!'));
      return false;
    }

    dispatch(collectionIntegrationsServicesSet(response.data));
  }
}