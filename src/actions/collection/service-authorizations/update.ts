import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE';

export default function collectionServiceAuthorizationUpdate(serviceName, serviceAuthorization) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE, serviceAuthorization });

    let requestBody = {};
    if (serviceName == "robin") {
      requestBody = {
        "credentials": {
          "robin_access_token": serviceAuthorization.credentials.robinAccessToken,
          "robin_organization_id": serviceAuthorization.credentials.robinOrganizationId,
        },
        "default": serviceAuthorization.default,
      }
    }

    try {
      const response = await core().put(`/integrations/service_authorizations/${serviceAuthorization.id}/`, requestBody);
      dispatch(integrationServicesList());
      return response;
    } catch (err) {
      dispatch(collectionServiceAuthorizationsError(err));
      return false;
    }
  };
}
