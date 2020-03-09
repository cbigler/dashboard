import dashboardsError from '../dashboards/error';
import dashboardsSetData from '../dashboards/set-data';
import spaceHierarchySet from '../collection/space-hierarchy/set';

import { sanitizeReportSettings } from '../../helpers/casing';
import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { DensityDashboard, DensityReport } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import setDashboardDate from '../miscellaneous/set-dashboard-date';
import moment from 'moment-timezone';

export const ROUTE_TRANSITION_DASHBOARD_EDIT = 'ROUTE_TRANSITION_DASHBOARD_EDIT';

export default async function routeTransitionDashboardEdit(dispatch, dashboard_id) {
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_EDIT, dashboard_id });

  let dashboard: DensityDashboard,
      reportList: Array<DensityReport>,
      spaceHierarchy: Array<CoreSpaceHierarchyNode>,
      timeSegmentLabels;
  try {
    [dashboard, reportList, spaceHierarchy, timeSegmentLabels] = await Promise.all([
      fetchObject<DensityDashboard>(`/dashboards/${dashboard_id}`, { cache: false }),
      fetchAllObjects<DensityReport>('/reports', { cache: false }),
      fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false }),
      fetchAllObjects<any>('/time_segments/labels', { cache: false }),
    ]);
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  // TODO: sanitize report settings, because we have saved reports with mixed/inconsistent casing
  dashboard.report_set = dashboard.report_set.map(r => sanitizeReportSettings(r));
  reportList = reportList.map(r => sanitizeReportSettings(r));

  dispatch(setDashboardDate(moment().format('YYYY-MM-DD')));
  dispatch(dashboardsSetData(dashboard, reportList, timeSegmentLabels));
  dispatch(spaceHierarchySet(spaceHierarchy));
}
