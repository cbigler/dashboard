import dashboardsError from '../dashboards/error';
import dashboardsSet from '../dashboards/set';

import { DensityDashboard } from '../../types';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { sanitizeReportSettings } from '../../helpers/casing';

export const ROUTE_TRANSITION_DASHBOARD_LIST = 'ROUTE_TRANSITION_DASHBOARD_LIST';

export default async function routeTransitionDashboardList(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_LIST });

  let dashboards;
  try {
    dashboards = await fetchAllObjects<DensityDashboard>('/dashboards', { cache: false });
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  if (dashboards.length === 0) {
    dispatch(dashboardsSet([]));
    return;
  }

  // TODO: sanitize report settings, because we have saved reports with mixed/inconsistent casing
  dashboards.forEach(dashboard => {
    dashboard.report_set = dashboard.report_set.map(r => sanitizeReportSettings(r));
  });

  window.location.href = `#/dashboards/${dashboards[0].id}`;
}
