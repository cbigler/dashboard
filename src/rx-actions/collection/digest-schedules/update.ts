import core from '../../../client/core';
import collectionDigestSchedulesError from './error';
import collectionDigestSchedulesPush from './push';
import { showToast } from '../../../rx-actions/toasts';

export const COLLECTION_DIGEST_SCHEDULES_UPDATE = 'COLLECTION_DIGEST_SCHEDULES_UPDATE';

export default async function collectionDigestSchedulesUpdate(dispatch, {
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
  dispatch({ type: COLLECTION_DIGEST_SCHEDULES_UPDATE });

  let schedule, errorThrown;
  try {
    schedule = await core().put(`/digest_schedules/${id}`, {
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
    dispatch(collectionDigestSchedulesError(errorThrown));
    showToast(dispatch, { type: 'error', text: `Whoops! That didn't work.` });
  } else {
    dispatch(collectionDigestSchedulesPush(schedule.data));
    showToast(dispatch, { text: 'Digest saved.' });
  }
}