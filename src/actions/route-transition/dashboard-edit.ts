import dashboardsError from '../dashboards/error';
import dashboardsPush from '../dashboards/push';
import dashboardsSetFormState from '../dashboards/set-form-state';
import dashboardsReportListSet from '../dashboards/report-list-set';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import { DensityDashboard, DensityReport, DensitySpaceHierarchyItem } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

function fetchDashboard(dashboardId) {
  return async (dispatch, getState) => {
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
  };
}

function fetchReportList() {
  return async dispatch => {
    let reportList;
    try {
      reportList = await fetchAllObjects<DensityReport>('/reports');
    } catch (err) {
      dispatch(dashboardsError(err));
      return;
    }
    dispatch(dashboardsReportListSet(reportList));
  };
}

function fetchSpaceHierarchy() {
  return async dispatch => {
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

export default function routeTransitionDashboardEdit(dashboardId) {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboardId });

    await Promise.all([
      dispatch(fetchDashboard(dashboardId)),
      dispatch(fetchReportList()),
      dispatch(fetchSpaceHierarchy()),
    ]);
  };
}
