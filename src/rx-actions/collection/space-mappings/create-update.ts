import collectionSpacesFetchAll from '../spaces/fetch-all';
import collectionSpaceMappingsError from './error';
import core from '../../../client/core';

export default async function collectionSpaceMappingsCreateUpdate(dispatch, service_space_id, space_id, service_id) {
  const requestBody = {
    "service_space_id": service_space_id,
    "service_id": service_id,
    "space_id": space_id,
  };

  let response, errorThrown;
  try {
    response = await core().post(`/integrations/space_mappings/`, requestBody);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    return dispatch(collectionSpaceMappingsError(errorThrown));
  } else {
    collectionSpacesFetchAll(dispatch);
    return response;
  }
}
