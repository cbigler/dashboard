import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import { core } from '../../../client';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../../helpers/space-time-utilities/index';

export const COLLECTION_SPACES_RESET_COUNT = 'COLLECTION_SPACES_RESET_COUNT';

export default function collectionSpacesResetCount(space, newCount) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_RESET_COUNT, item: space, newCount });

    try {
      const response = await core.spaces.reset({
        id: space.id,
        count: newCount,
        timestamp: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
      });
      dispatch(collectionSpacesPush({...space, currentCount: newCount}));
      return response;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
