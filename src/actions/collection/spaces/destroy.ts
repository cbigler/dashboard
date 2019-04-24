import collectionSpacesDelete from './delete';
import collectionSpacesError from './error';
import core from '../../../client/core';

export const COLLECTION_SPACES_DESTROY = 'COLLECTION_SPACES_DESTROY';

export default function collectionSpacesDestroy(space) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_DESTROY, space });

    try {
      await core().delete(`/spaces/${space.id}`, { data: { name: space.name } });
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }

    dispatch(collectionSpacesDelete(space));
    return true;
  };
}
