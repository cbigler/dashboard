import core from '../../client/core';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensityNotification } from '../../types';
import { AlertActionTypes } from '../../types/alerts';
import { DispatchType } from '../../types/rx-actions';

export function getNotificationsURL() {
  const baseV1 = (core().defaults.baseURL || 'https://api.density.io/v2').replace('/v2', '/v1');
  return `${baseV1}/notifications`;
}

export default async function collectionAlertsLoad(dispatch: DispatchType) {
  dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_LOAD });

  let alerts = [] as Array<DensityNotification>;
  let errorThrown;
  try {
    alerts = await fetchAllObjects<DensityNotification>(getNotificationsURL());
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_ERROR, error: errorThrown });
  } else {
    // Only load SMS notifications right now
    dispatch({
      type: AlertActionTypes.COLLECTION_ALERTS_SET,
      alerts: alerts.filter(x => x.notificationType === 'sms'),
    });
  }
}
