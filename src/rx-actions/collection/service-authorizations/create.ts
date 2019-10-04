import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_CREATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_CREATE';

export default async function collectionServiceAuthorizationCreate(dispatch, serviceName, serviceAuthorization) {
  dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_CREATE });

  let requestBody = {}
  if (serviceName === "robin") {
    requestBody = {
      "robin_access_token": serviceAuthorization.credentials.robinAccessToken,
      "robin_organization_id": serviceAuthorization.credentials.robinOrganizationId,
    }
  }

  try {
    await core().post(`/integrations/${serviceName}/`, requestBody);
  } catch (err) {
    dispatch(collectionServiceAuthorizationsError(err));
    return false;
  }

  integrationServicesList(dispatch);
  return true;
}
