import collectionSpacesFetchAll from '../spaces/fetch-all';
import collectionSpaceMappingsError from './error';
import core from '../../../client/core';


export default function collectionSpaceMappingsDestroy(spaceMappingId) {
  return async dispatch => {
    let errorThrown
    try {
      await core().delete(`/integrations/space_mappings/${spaceMappingId}`);
    } catch (err) {
      errorThrown = err;
    }
    
    if (errorThrown) {
      return dispatch(collectionSpaceMappingsError(errorThrown));
    } else {
      return dispatch(collectionSpacesFetchAll({force: true}));
    }
  };
}
