import core from '../../../client/core';
import collectionDispatchSchedulesError from './error';
import collectionDispatchSchedulesRemove from './remove';

export const COLLECTION_DISPATCH_SCHEDULES_DESTROY = 'COLLECTION_DISPATCH_SCHEDULES_DESTROY';

export default function collectionDispatchSchedulesDestroy(schedule) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DISPATCH_SCHEDULES_DESTROY });

    let errorThrown;
    try {
      await core().delete(`/digest_schedules/${schedule.id}`);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionDispatchSchedulesError(errorThrown));
      return false;
    } else {
      dispatch(collectionDispatchSchedulesRemove(schedule));
      return true;
    }
  }
}
