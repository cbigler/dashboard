import core from '../../../client/core';
import collectionDigestSchedulesError from './error';
import collectionDigestSchedulesPush from './push';
import mixpanelTrack from '../../../helpers/tracking/mixpanel-track';
import { showToast } from '../../../rx-actions/toasts';

export const COLLECTION_DIGEST_SCHEDULES_CREATE = 'COLLECTION_DIGEST_SCHEDULES_CREATE';

export default async function collectionDigestSchedulesCreate(dispatch, {
  name,
  recipients,
  dashboard_id,
  frequency,
  days_of_week,
  day_number,
  time,
  time_zone,
}) {
  dispatch({ type: COLLECTION_DIGEST_SCHEDULES_CREATE });

  let schedule, errorThrown;
  try {
    schedule = await core().post(`/digest_schedules`, {
      name: name,
      recipients: recipients,
      dashboard_id: dashboard_id,
      frequency: frequency,
      days_of_week: days_of_week,
      day_number: day_number,
      time: time,
      time_zone: time_zone,
    });

    mixpanelTrack('Email Digest Created', {
      name: name,
      dashboard_id: dashboard_id,
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
