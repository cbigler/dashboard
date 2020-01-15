import core from '../../client/core';
import { getNotificationsURL } from './read';
import { DensityNotification } from '../../types';
import { DispatchType } from '../../types/rx-actions';
import { AlertActionTypes } from '../../types/alerts';

export default async function collectionAlertsUpdate(
  dispatch: DispatchType,
  alert: DensityNotification,
) {
  //dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_UPDATE });

  let response, errorThrown;
  try {
    const meta = alert.meta || {};
    response = await core().put(`${getNotificationsURL()}/${alert.id}`, {
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
