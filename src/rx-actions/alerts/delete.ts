import core from '../../client/core';
import { getNotificationsURL } from './read';
import { DensityNotification } from '../../types';
import { AlertActionTypes } from '../../interfaces/alerts';
import { DispatchType } from '../../interfaces';

export default async function collectionAlertsDelete(
  dispatch: DispatchType,
  alert: DensityNotification,
) {
  //dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_DESTROY });

  let errorThrown;
  try {
    await core().delete(`${getNotificationsURL()}/${alert.id}`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_ERROR, error: errorThrown });
    return false;
  } else {
    dispatch({ type: AlertActionTypes.COLLECTION_ALERTS_REMOVE, alert });
    return true;
  }
}
