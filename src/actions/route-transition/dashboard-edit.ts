import dashboardsError from '../dashboards/error';
import dashboardsPush from '../dashboards/push';
import dashboardsSetFormState from '../dashboards/set-form-state';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import { DensityDashboard, DensitySpaceHierarchyItem } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

export default function routeTransitionDashboardEdit(dashboardId) {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

    // If the dashboard has already been loaded, then don't fetch its data again
    let dashboard = getState().dashboards.data.find(d => d.id === dashboardId);
    if (!dashboard) {
      try {
        dashboard = await fetchObject<DensityDashboard>(`/dashboards/${dashboardId}`);
      } catch (err) {
        dispatch(dashboardsError(err));
        return;
      }
      dispatch(dashboardsPush(dashboard));
    }

    dispatch(dashboardsSetFormState(dashboard));

    let spaceHierarchy;
    try {
      spaceHierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }
    dispatch(spaceHierarchySet(spaceHierarchy));
  };
}
