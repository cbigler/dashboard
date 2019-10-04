import dashboardsError from '../dashboards/error';
import dashboardsSetData from '../dashboards/set-data';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import {
  DensityDashboard,
  DensityReport,
  DensitySpaceHierarchyItem,
} from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

export default async function routeTransitionDashboardEdit(dispatch, dashboardId) {
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

  let dashboard, reportList, spaceHierarchy, timeSegmentLabels;
  try {
    [dashboard, reportList, spaceHierarchy, timeSegmentLabels] = await Promise.all([
      fetchObject<DensityDashboard>(`/dashboards/${dashboardId}`),
      fetchAllObjects<DensityReport>('/reports'),
      fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy'),
      fetchAllObjects<any>('/time_segments/labels'),
    ]);
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  dispatch(dashboardsSetData(dashboard, reportList, timeSegmentLabels));
  dispatch(spaceHierarchySet(spaceHierarchy));
}