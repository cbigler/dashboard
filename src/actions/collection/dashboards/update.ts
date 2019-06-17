import core from '../../../client/core';
import collectionDashboardsError from './error';

export const COLLECTION_DASHBOARDS_UPDATE = 'COLLECTION_DASHBOARDS_UPDATE';

export default function collectionDashboardsUpdate(dashboard) {
  return async dispatch => {
    dispatch({type: COLLECTION_DASHBOARDS_UPDATE});

    try {
      await core().put(`/dashboards/${dashboard.id}`, {
        name: dashboard.name,
        report_set: dashboard.reportSet,
      });
    } catch (err) {
      dispatch(collectionDashboardsError(err));
      return false;
    }
    return true;
  };
}
