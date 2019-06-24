import dashboardsError from '../dashboards/error';
import dashboardsSetData from '../dashboards/set-data';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import {
  DensityDashboard,
  DensityReport,
  DensitySpaceHierarchyItem,
  DensitySpace,
} from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

async function fetchDashboard(state, dashboardId) {
  // If the dashboard has already been loaded, then don't fetch its data again
  let dashboard = state.dashboards.data.find(d => d.id === dashboardId);
  if (!dashboard) {
    return fetchObject<DensityDashboard>(`/dashboards/${dashboardId}`);
  }
  return dashboard;
}

export default function routeTransitionDashboardEdit(dashboardId) {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

    let dashboard, reportList, spaceHierarchy, timeSegmentLabels;
    try {
      [dashboard, reportList, spaceHierarchy, timeSegmentLabels] = await Promise.all([
        fetchDashboard(getState(), dashboardId),
        fetchAllObjects<DensityReport>('/reports'),
        fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy'),
        fetchAllObjects<any>('/time_segments/labels'),
      ]);
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }

    dispatch(dashboardsSetData(dashboard, reportList, timeSegmentLabels));
    dispatch(spaceHierarchySet(spaceHierarchy))
  };
}
