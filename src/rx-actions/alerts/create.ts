import core from '../../client/core';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import { DensityNotification } from '../../types';
import { getNotificationsURL } from './read';
import { AlertActionTypes } from '../../types/alerts';
import { DispatchType } from '../../types/rx-actions';

export default async function collectionAlertsCreate(
  dispatch: DispatchType,
  alert: DensityNotification,
) {
  //dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_CREATE });
  let response, errorThrown;
  
  try {
    const meta = alert.meta || {};
    response = await core().post(getNotificationsURL(), {
      space_id: alert.space_id,
      enabled: alert.enabled,
      trigger_type: alert.trigger_type,
      trigger_value: alert.trigger_value,
      is_one_shot: alert.is_one_shot,
      cooldown: alert.cooldown,
      meta: {
        to_num: meta.to_num,
        escalation_delta: meta.escalation_delta,
      },
    });

    mixpanelTrack('SMS Alert Created', {
      trigger_type: alert.trigger_type,
      trigger_value: alert.trigger_value,
      space_id: alert.space_id,
    });

  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_ERROR, error: errorThrown });
  } else {
    dispatch({
      type: AlertActionTypes.COLLECTION_ALERTS_PUSH,
      alert: response.data as DensityNotification,
    });
  }
}
