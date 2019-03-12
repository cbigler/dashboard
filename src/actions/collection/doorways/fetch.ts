import collectionDoorwaysSet from './set';
import collectionDoorwaysError from './error';
import core from '../../../client/core';

export const COLLECTION_DOORWAYS_FETCH = 'COLLECTION_DOORWAYS_FETCH';

export default function collectionDoorwaysFetch() {
  return async dispatch => {
    dispatch({ type: COLLECTION_DOORWAYS_FETCH });

    try {
      const response = await core().get('/doorways?environment=true', { params: {environment: true} });
      dispatch(collectionDoorwaysSet(response.data.results));
      return response.data;
    } catch (err) {
      dispatch(collectionDoorwaysError(err));
      return false;
    }
  };
}
