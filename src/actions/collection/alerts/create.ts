import core from '../../../client/core';
import collectionAlertsError from './error';
import collectionAlertsPush from './push';
import mixpanelTrack from '../../../helpers/mixpanel-track/index';
import { DensityNotification } from '../../../types';
import { getNotificationsURL } from './load';

export const COLLECTION_ALERTS_CREATE = 'COLLECTION_ALERTS_CREATE';

export default function collectionAlertsCreate({
  spaceId,
  enabled,
  triggerType,
  triggerValue,
  isOneShot,
  cooldown,
  meta
}: DensityNotification) {
  return async dispatch => {
    dispatch({ type: COLLECTION_ALERTS_CREATE });

    let alert, errorThrown;
    try {
      alert = await core().post(getNotificationsURL(), {
        space_id: spaceId,
        enabled: enabled,
        trigger_type: triggerType,
        trigger_value: triggerValue,
        is_one_shot: isOneShot,
        cooldown: cooldown,
        meta: meta,
      });

      mixpanelTrack('SMS Alert Created', {
        trigger_type: triggerType,
        trigger_value: triggerValue,
        space_id: spaceId,
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
