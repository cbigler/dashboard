import dashboardsError from '../collection/dashboards/error';
import dashboardsPush from '../collection/dashboards/push';
import dashboardsSetFormState from '../dashboards/set-form-state';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import { DensityDashboard, DensitySpaceHierarchyItem } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

export default function routeTransitionDashboardEdit(dashboardId) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

    let spaceHierarchy;
    try {
      spaceHierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }
    dispatch(spaceHierarchySet(spaceHierarchy));

    let dashboard;
    try {
      dashboard = await fetchObject<DensityDashboard>(`/dashboards/${dashboardId}`);
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }

    dispatch(dashboardsSetFormState(dashboard));
    dispatch(dashboardsPush(dashboard));
  };
}
