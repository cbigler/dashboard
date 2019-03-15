import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import core from '../../../client/core';

export const COLLECTION_SPACES_UPDATE = 'COLLECTION_SPACES_UPDATE';

export default function collectionSpacesUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_UPDATE, item });

    try {
      const response = await core().put(`/spaces/${item.id}`, {
        name: item.name,
        description: item.description,
        daily_reset: item.dailyReset,
        time_zone: item.timeZone,
        capacity: item.capacity,
      });
      dispatch(collectionSpacesPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
