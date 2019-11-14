import integrationServicesList from '../../integrations/services';
import collectionServiceAuthorizationError from './error';
import core from '../../../client/core';

export const COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY = 'COLLECTION_SERVICE_AUTHORIZATION_DESTROY';

export default async function collectionServiceAuthorizationDestroy(dispatch, serviceAuthorizationId) {
  dispatch({ type: COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY, serviceAuthorizationId });

  try {
    await core().delete(`/integrations/service_authorizations/${serviceAuthorizationId}`);
  } catch (err) {
    dispatch(collectionServiceAuthorizationError(err));
    return false;
  }
  integrationServicesList(dispatch);
  return true;
}
