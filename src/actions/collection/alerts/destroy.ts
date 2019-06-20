import core from '../../../client/core';
import collectionAlertsError from './error';
import collectionAlertsRemove from './remove';
import { getNotificationsURL } from './load';

export const COLLECTION_ALERTS_DESTROY = 'COLLECTION_ALERTS_DESTROY';

export default function collectionAlertsDestroy(alert) {
  return async dispatch => {
    dispatch({ type: COLLECTION_ALERTS_DESTROY });

    let errorThrown;
    try {
      await core().delete(`${getNotificationsURL()}/${alert.id}`);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionAlertsError(errorThrown));
      return false;
    } else {
      dispatch(collectionAlertsRemove(alert));
      return true;
    }
  }
}
