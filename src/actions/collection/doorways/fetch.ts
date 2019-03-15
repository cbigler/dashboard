import collectionDoorwaysSet from './set';
import collectionDoorwaysError from './error';
import { core } from '../../../client';

export const COLLECTION_DOORWAYS_FETCH = 'COLLECTION_DOORWAYS_FETCH';

export default function collectionDoorwaysFetch() {
  return async dispatch => {
    dispatch({ type: COLLECTION_DOORWAYS_FETCH });

    try {
      const response = await core.doorways.list({environment: true});
      dispatch(collectionDoorwaysSet(response.results));
      return response;
    } catch (err) {
      dispatch(collectionDoorwaysError(err));
      return false;
    }
  };
}
