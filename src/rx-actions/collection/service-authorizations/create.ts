import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationsError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_CREATE = 'COLLECTION_SERVICE_AUTHORIZATIONS_CREATE';

export default async function collectionServiceAuthorizationCreate(dispatch, serviceName, service_authorization) {
  dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_CREATE });

  let requestBody = {}
  if (serviceName === "robin") {
    requestBody = {
      "robin_access_token": service_authorization.credentials.robin_access_token,
      "robin_organization_id": service_authorization.credentials.robin_organization_id,
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
