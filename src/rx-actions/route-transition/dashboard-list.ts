import dashboardsError from '../dashboards/error';
import dashboardsSet from '../dashboards/set';

import { DensityDashboard } from '../../types';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_LIST = 'ROUTE_TRANSITION_DASHBOARD_LIST';

export default async function routeTransitionDashboardList(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_LIST });

  let dashboards;
  try {
    dashboards = await fetchAllObjects<DensityDashboard>('/dashboards');
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  if (dashboards.length === 0) {
    dispatch(dashboardsSet([]));
    return;
  }

  window.location.href = `#/dashboards/${dashboards[0].id}`;
}
