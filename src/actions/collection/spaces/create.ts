import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import core from '../../../client/core';

export const COLLECTION_SPACES_CREATE = 'COLLECTION_SPACES_CREATE';

export default function collectionSpacesCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_CREATE, item });

    try {
      const response = await core().post('/spaces', {
        name: item.name,
        description: item.description,
        timezone: item.timeZone,
        daily_reset: item.dailyReset,
      });
      dispatch(collectionSpacesPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
