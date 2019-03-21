import core from '../../client/core';
import collectionSpacesSet from '../collection/spaces/set';


export default function integrationsSaveSpaceMapping(spaceMapping, space, serviceSpaceId) {
  let shouldCreate = (spaceMapping == null);

  return async dispatch => {
    let response;

    try {
      if (shouldCreate) {
        response = await core().post(`/integrations/space_mappings/`, {
          space_id: space.id,
          service_space_id: serviceSpaceId,
          service: 'robin'
        });
        
      } else {
        response = await core().put(`/integrations/space_mappings/${spaceMapping.id}/`, {
          service_space_id: serviceSpaceId
        });
      }

      // refetch spaces for right now
      // so that the spaceMappings in the space object is correct
      const spaces = await core().get(`/spaces`);

      dispatch(collectionSpacesSet(spaces.data.results));

    } catch (err) {
      return false;
    }
    return response;
  };
}
