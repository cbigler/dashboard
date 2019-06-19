import core from '../../../client/core';
import collectionAlertsError from './error';
import collectionAlertsPush from './push';
import { DensityNotification } from '../../../types';
import { getNotificationsURL } from './load';

export const COLLECTION_ALERTS_UPDATE = 'COLLECTION_ALERTS_UPDATE';

export default function collectionAlertsUpdate({
  id,
  spaceId,
  enabled,
  triggerType,
  triggerValue,
  isOneShot,
  cooldown,
  meta
}: DensityNotification) {
  return async dispatch => {
    dispatch({ type: COLLECTION_ALERTS_UPDATE });

    let alert, errorThrown;
    try {
      alert = await core().put(`${getNotificationsURL()}/${id}`, {
        space_id: spaceId,
        enabled: enabled,
        trigger_type: triggerType,
        trigger_value: triggerValue,
        is_one_shot: isOneShot,
        cooldown: cooldown,
        meta: meta,
      });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionAlertsError(errorThrown));
      return false;
    } else {
      dispatch(collectionAlertsPush(alert.data));
      return true;
    }
  }
}
