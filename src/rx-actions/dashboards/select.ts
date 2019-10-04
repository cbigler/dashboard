import dashboardsCalculateReportData from './calculate-report-data';

export const DASHBOARDS_SELECT = 'DASHBOARDS_SELECT';

export default async function dashboardsSelect(dispatch, dashboard, date, weekStart) {
  dispatch({ type: DASHBOARDS_SELECT, dashboard });
  await dashboardsCalculateReportData(dispatch, dashboard.reportSet, date, weekStart);
}
