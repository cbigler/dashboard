import core from '../../client/core';
import dashboardsError from './error';

export const DASHBOARDS_DESTROY = 'DASHBOARDS_DESTROY';

export default async function dashboardsDestroy(dispatch, dashboard) {
  try {
    await core().delete(`/dashboards/${dashboard.id}`);
  } catch (err) {
    dispatch(dashboardsError(err));
    return false;
  }
  dispatch({type: DASHBOARDS_DESTROY, dashboard});
  return true;
}
