import core from '../../../client/core';
import collectionAlertsError from './error';
import collectionAlertsSet from './set';
import fetchAllObjects from '../../../helpers/fetch-all-objects';
import { DensityNotification } from '../../../types';

export const COLLECTION_ALERTS_LOAD = 'COLLECTION_ALERTS_LOAD';

export function getNotificationsURL() {
  const baseV1 = (core().defaults.baseURL || 'https://api.density.io/v2').replace('/v2', '/v1');
  return `${baseV1}/notifications`;
}

export default function collectionAlertsLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_ALERTS_LOAD });

    let alerts, errorThrown;
    try {
      alerts = await fetchAllObjects<DensityNotification>(getNotificationsURL());
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionAlertsError(errorThrown));
    } else {
      // Only load SMS notifications right now
      dispatch(collectionAlertsSet(alerts.filter(x => x.triggerType === 'sms')));
    }
  }
}
