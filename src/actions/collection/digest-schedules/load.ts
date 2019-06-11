import collectionDigestSchedulesError from './error';
import collectionDigestSchedulesSet from './set';
import fetchAllObjects from '../../../helpers/fetch-all-objects';
import { DensityDigestSchedule } from '../../../types';

export const COLLECTION_DIGEST_SCHEDULES_LOAD = 'COLLECTION_DIGEST_SCHEDULES_LOAD';

export default function collectionDigestSchedulesLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_DIGEST_SCHEDULES_LOAD });

    let schedules, errorThrown;
    try {
      schedules = await fetchAllObjects<DensityDigestSchedule>('/digest_schedules');
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
