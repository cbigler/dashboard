import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_CREATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_CREATE';

export default function collectionServiceAuthorizationCreate(serviceName, serviceAuthorization) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_CREATE });

    let requestBody = {}
    if (serviceName == "robin") {
      requestBody = {
        "robin_access_token": serviceAuthorization.credentials.robinAccessToken,
        "robin_organization_id": serviceAuthorization.credentials.robinOrganizationId,
      }
    }

    let response;
    try {
      response = await core().post(`/integrations/${serviceName}/`, requestBody);
    } catch (err) {
      dispatch(collectionServiceAuthorizationsError(err));
      return false;
    }

    dispatch(integrationServicesList());
    return response;
  };
}
