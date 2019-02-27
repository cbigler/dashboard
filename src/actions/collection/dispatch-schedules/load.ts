export const COLLECTION_DISPATCH_SCHEDULES_LOAD = 'COLLECTION_DISPATCH_SCHEDULES_LOAD';

import { core } from '../../../client';
import collectionDispatchSchedulesError from './error';
import collectionDispatchSchedulesSet from './set';

export default function collectionDispatchSchedulesLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_DISPATCH_SCHEDULES_LOAD });

    let schedules, errorThrown;
    try {
      schedules = await core.dispatch_schedules.list();
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionDispatchSchedulesError(errorThrown));
    } else {
      dispatch(collectionDispatchSchedulesSet(schedules));
    }
  }
}
