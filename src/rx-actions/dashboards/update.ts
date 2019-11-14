import core from '../../client/core';
import dashboardsError from './error';
import dashboardsPush from './push';

export const DASHBOARDS_UPDATE = 'DASHBOARDS_UPDATE';

export default async function dashboardsUpdate(dispatch, dashboard) {
  dispatch({type: DASHBOARDS_UPDATE});

  let dashboardResponse;
  try {
    dashboardResponse = await core().put(`/dashboards/${dashboard.id}`, {
      name: dashboard.name,
      report_set: dashboard.reportSet.map(report => report.id),
    });
  } catch (err) {
    dispatch(dashboardsError(err));
    return false;
  }

  // Update the dashboard in the collection
  dispatch(dashboardsPush(dashboardResponse.data));
  return true;
}
