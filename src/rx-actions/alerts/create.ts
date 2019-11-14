import core from '../../client/core';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
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
      space_id: alert.spaceId,
      enabled: alert.enabled,
      trigger_type: alert.triggerType,
      trigger_value: alert.triggerValue,
      is_one_shot: alert.isOneShot,
      cooldown: alert.cooldown,
      meta: {
        to_num: meta.toNum,
        escalation_delta: meta.escalationDelta,
      },
    });

    mixpanelTrack('SMS Alert Created', {
      trigger_type: alert.triggerType,
      trigger_value: alert.triggerValue,
      space_id: alert.spaceId,
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
      alert: objectSnakeToCamel<DensityNotification>(response.data),
    });
  }
}
