import collectionSpacesFetchAll from '../spaces/fetch-all';
import collectionSpaceMappingsError from './error';
import core from '../../../client/core';


export default function collectionSpaceMappingsCreateUpdate(serviceSpaceId, spaceId, serviceId) {
  return async dispatch => {
    const requestBody = {
      "service_space_id": serviceSpaceId,
      "service_id": serviceId,
      "space_id": spaceId,
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
      dispatch(collectionSpacesFetchAll({force: true}));
      return response;
    }
  };
}
