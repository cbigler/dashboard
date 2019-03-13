export const COLLECTION_DISPATCH_SCHEDULES_CREATE = 'COLLECTION_DISPATCH_SCHEDULES_CREATE';

import { core } from '../../../client';
import collectionDispatchSchedulesError from './error';
import collectionDispatchSchedulesPush from './push';

export default function collectionDispatchSchedulesCreate({
  name,
  recipients,
  dashboardId,
  frequency,
  daysOfWeek,
  dayNumber,
  time,
  timeZone,
}) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DISPATCH_SCHEDULES_CREATE });

    let schedule, errorThrown;
    try {
      schedule = await core.digest_schedules.create({
        name: name,
        recipients: recipients,
        dashboard_id: dashboardId,
        frequency: frequency,
        days_of_week: daysOfWeek,
        day_number: dayNumber,
        time: time,
        time_zone: timeZone,
      });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionDispatchSchedulesError(errorThrown));
      return false;
    } else {
      dispatch(collectionDispatchSchedulesPush(schedule));
      return true;
    }
  }
}
