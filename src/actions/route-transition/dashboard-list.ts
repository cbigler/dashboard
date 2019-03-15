import { core } from '../../client';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import dashboardsError from '../collection/dashboards/error';

export const ROUTE_TRANSITION_DASHBOARD_LIST = 'ROUTE_TRANSITION_DASHBOARD_LIST';

export default function routeTransitionDashboardList() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_LIST });

    const dashboards = await core.dashboards.list({page: 1, page_size: 1});
    if (dashboards.results.length === 0) {
      dispatch(dashboardsError('No dashboards were found. Please talk to your Density account representative to create a dashboard.'));
      return;
    }

    const results: any = objectSnakeToCamel(dashboards.results[0]);
    window.location.href = `#/dashboards/${results.id}`;
  };
}
