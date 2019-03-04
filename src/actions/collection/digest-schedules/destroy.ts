export const COLLECTION_DISPATCH_SCHEDULES_DESTROY = 'COLLECTION_DISPATCH_SCHEDULES_DESTROY';

import { core } from '../../../client';
import collectionDispatchSchedulesError from './error';
import collectionDispatchSchedulesPush from './push';
import collectionDispatchSchedulesRemove from './remove';

export default function collectionDispatchSchedulesDestroy(schedule) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DISPATCH_SCHEDULES_DESTROY });
    console.log('SCHEDULE', schedule)

    let errorThrown;
    try {
      await core.digest_schedules.delete({ id: schedule.id });
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
