import core from '../../client/core';
import dashboardsError from './error';

export const DASHBOARDS_UPDATE = 'DASHBOARDS_UPDATE';

export default function dashboardsUpdate(dashboard) {
  return async dispatch => {
    dispatch({type: DASHBOARDS_UPDATE});

    try {
      await core().put(`/dashboards/${dashboard.id}`, {
        name: dashboard.name,
        report_set: dashboard.reportSet.map(report => report.id),
      });
    } catch (err) {
      dispatch(dashboardsError(err));
      return false;
    }
    return true;
  };
}
