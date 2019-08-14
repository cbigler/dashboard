import core from '../../client/core';
import { getNotificationsURL } from './read';
import { DensityNotification } from '../../types';
import { DispatchType } from '../../interfaces';
import { AlertActionTypes } from '../../interfaces/alerts';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';

export default async function collectionAlertsUpdate(
  dispatch: DispatchType,
  alert: DensityNotification,
) {
  //dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_UPDATE });

  let response, errorThrown;
  try {
    const meta = alert.meta || {};
    response = await core().put(`${getNotificationsURL()}/${alert.id}`, {
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
