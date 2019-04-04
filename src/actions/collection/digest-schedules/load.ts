export const COLLECTION_DIGEST_SCHEDULES_LOAD = 'COLLECTION_DIGEST_SCHEDULES_LOAD';

import core from '../../../client/core';
import collectionDigestSchedulesError from './error';
import collectionDigestSchedulesSet from './set';

export default function collectionDigestSchedulesLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_DIGEST_SCHEDULES_LOAD });

    let schedules, errorThrown;
    try {
    schedules = await core().get('/digest_schedules');
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionDigestSchedulesError(errorThrown));
    } else {
      dispatch(collectionDigestSchedulesSet(schedules));
    }
  }
}