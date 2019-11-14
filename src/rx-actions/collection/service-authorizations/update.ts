import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE';

export async function collectionServiceAuthorizationMakeDefault(dispatch, serviceAuthorizationId) {
  dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE });

  let response, errorThrown;
  try {
    response = await core().put(`/integrations/service_authorizations/${serviceAuthorizationId}/`, {'default': true});
  } catch (err) {
    errorThrown = err  
  }

  if (errorThrown) {
    dispatch(collectionServiceAuthorizationsError(errorThrown));
    return false;  
  } else {
    integrationServicesList(dispatch);
    return response;  
  }
}
