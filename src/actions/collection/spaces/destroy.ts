import collectionSpacesDelete from './delete';
import collectionSpacesError from './error';
import { core } from '../../../client';

export const COLLECTION_SPACES_DESTROY = 'COLLECTION_SPACES_DESTROY';

export default function collectionSpacesDestroy(space) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_DESTROY, space });

    try {
      await core.spaces.delete({id: space.id, name: space.name});
      dispatch(collectionSpacesDelete(space));
      return true;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
