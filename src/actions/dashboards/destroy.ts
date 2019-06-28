import core from '../../client/core';
import dashboardsError from './error';

export const DASHBOARDS_DESTROY = 'DASHBOARDS_DESTROY';

export default function dashboardsDestroy(dashboard) {
  return async dispatch => {
    try {
      await core().delete(`/dashboards/${dashboard.id}`);
    } catch (err) {
      dispatch(dashboardsError(err));
      return false;
    }
    return true;
  };
}
