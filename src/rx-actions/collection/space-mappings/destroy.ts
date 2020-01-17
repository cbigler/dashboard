import collectionSpacesFetchAll from '../spaces-legacy/fetch-all';
import collectionSpaceMappingsError from './error';
import core from '../../../client/core';


export default async function collectionSpaceMappingsDestroy(dispatch, spaceMappingId) {
  let response, errorThrown;
  try {
    response = await core().delete(`/integrations/space_mappings/${spaceMappingId}`);
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
