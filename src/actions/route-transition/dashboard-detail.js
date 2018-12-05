import { core } from '../../client';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import collectionDashboardsSet from '../collection/dashboards/set';
import collectionDashboardsError from '../collection/dashboards/error';
import collectionDashboardsSelect from '../collection/dashboards/select';

import fetchAllPages from '../../helpers/fetch-all-pages/index';

export const ROUTE_TRANSITION_DASHBOARD_DETAIL = 'ROUTE_TRANSITION_DASHBOARD_DETAIL';

export default function routeTransitionDashboardDetail(id) {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_DETAIL });

    let dashboardSelectionPromise;

    // First, if the dashboard already is in the collection, then immediately select it.
    let selectedDashboard = getState().dashboards.data.find(d => d.id === id);
    if (selectedDashboard) {
      // The data for the dashboard being selected already exists, so don't "reset the state" as
      // this will show a loading state / remove all dashboards that are already in the collection
      // and that's not desired.
      dashboardSelectionPromise = dispatch(collectionDashboardsSelect(selectedDashboard));
    }

    // Though this route is only to load a single dashboard, we need to load all dashboards in order
    // to render the list on the left side of the screen.
    //
    // So, next, load all dashboards. Even if all dashboards are set, loading them again isn't a bad
    // idea and ensures we have up to date data.

    let dashboards;
    try {
      dashboards = await fetchAllPages(page => core.dashboards.list({page, page_size: 5000}));
    } catch (err) {
      dispatch(collectionDashboardsError(err));
      return;
    }

    const results = dashboards.map(objectSnakeToCamel);
    dispatch(collectionDashboardsSet(results));

    if (results.length === 0) {
      console.warn('Display an error relating to when there are no dashboards and something about contacting your density account manager');
      return;
    }

    // Now, if the dashboard to be selected hasn't already been selected (optimistically, at the top
    // of the function), then select it now that it has been loaded.
    if (!selectedDashboard) {
      selectedDashboard = results.find(dashboard => dashboard.id === id);
      if (!selectedDashboard) {
        console.warn('Do the equivelent of a 404 not found type of error here');
        return;
      }
      dashboardSelectionPromise = dispatch(collectionDashboardsSelect(selectedDashboard));
    }

    // Wait for the dashboard selection to complete
    await dashboardSelectionPromise;
  };
}
