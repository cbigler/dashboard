export const COLLECTION_DISPATCH_SCHEDULES_UPDATE = 'COLLECTION_DISPATCH_SCHEDULES_UPDATE';

import { core } from '../../../client';
import collectionDispatchSchedulesError from './error';
import collectionDispatchSchedulesPush from './push';

export default function collectionDispatchSchedulesUpdate({
  id,
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
    dispatch({ type: COLLECTION_DISPATCH_SCHEDULES_UPDATE });

    let schedule, errorThrown;
    try {
      schedule = await core.digest_schedules.update({
        id: id,
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
