import dashboardsCalculateReportData from './calculate-report-data';

export const DASHBOARDS_SELECT = 'DASHBOARDS_SELECT';

export default function dashboardsSelect(dashboard, date, weekStart) {
  return async dispatch => {
    dispatch({ type: DASHBOARDS_SELECT, dashboard });
    await dispatch(dashboardsCalculateReportData(dashboard.reportSet, date, weekStart));
  };
}
