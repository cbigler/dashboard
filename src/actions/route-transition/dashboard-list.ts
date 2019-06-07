import dashboardsError from '../collection/dashboards/error';

import { DensityDashboard } from '../../types';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_LIST = 'ROUTE_TRANSITION_DASHBOARD_LIST';

export default function routeTransitionDashboardList() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_LIST });

    const dashboards = await fetchAllObjects<DensityDashboard>('/dashboards');
    if (dashboards.length === 0) {
      dispatch(dashboardsError('No dashboards were found. Please talk to your Density account representative to create a dashboard.'));
      return;
    }

		window.location.href = `#/dashboards/${dashboards[0].id}`;
  };
}
