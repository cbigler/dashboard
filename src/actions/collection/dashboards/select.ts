import collectionDashboardsCalculateReportData from './calculate-report-data';

export const COLLECTION_DASHBOARDS_SELECT = 'COLLECTION_DASHBOARDS_SELECT';

export default function collectionDashboardsSelect(dashboard, date, weekStart) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DASHBOARDS_SELECT, dashboard });
    await dispatch(collectionDashboardsCalculateReportData(dashboard.reportSet, date, weekStart));
  };
}
