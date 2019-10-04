import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE';

export async function collectionServiceAuthorizationUpdate(dispatch, serviceName, serviceAuthorization) {
  dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE });

  let requestBody = {};
  if (serviceName === "robin") {
    requestBody = {
      "credentials": {
        "robin_access_token": serviceAuthorization.credentials.robinAccessToken,
        "robin_organization_id": serviceAuthorization.credentials.robinOrganizationId,
      },
      "default": serviceAuthorization.default,
    }
  }

  let response, errorThrown;
  try {
    response = await core().put(`/integrations/service_authorizations/${serviceAuthorization.id}/`, requestBody);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    dispatch(collectionServiceAuthorizationsError(errorThrown));
    return false;
  } else {
    integrationServicesList(dispatch);
    return response;
  }
}

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
