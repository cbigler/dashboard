import collectionDoorwaysDelete from './delete';
import collectionDoorwaysError from './error';
import { core } from '../../../client';

export const COLLECTION_DOORWAYS_DESTROY = 'COLLECTION_DOORWAYS_DESTROY';

export default function collectionDoorwaysDestroy(doorway) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DOORWAYS_DESTROY, doorway });

    try {
      await core.doorways.delete({id: doorway.id});
      dispatch(collectionDoorwaysDelete(doorway));
      return true;
    } catch (err) {
      dispatch(collectionDoorwaysError(err));
      return false;
    }
  };
}
