export const DASHBOARDS_REPORT_LIST_SET = 'DASHBOARDS_REPORT_LIST_SET';

export default function dashboardsReportListSet(reportList) {
  return { type: DASHBOARDS_REPORT_LIST_SET, reportList };
}
