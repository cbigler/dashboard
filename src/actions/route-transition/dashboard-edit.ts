import dashboardsError from '../collection/dashboards/error';
import dashboardsPush from '../collection/dashboards/push';

import { DensityDashboard } from '../../types';
import { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

export default function routeTransitionDashboardEdit(dashboardId) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

    let dashboard;
    try {
      dashboard = await fetchObject<DensityDashboard>(`/dashboards/${dashboardId}`);
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }

    dispatch(dashboardsPush(dashboard));
  };
}
