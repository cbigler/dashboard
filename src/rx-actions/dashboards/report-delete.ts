import core from '../../client/core';

export const DASHBOARDS_REPORT_DELETE = 'DASHBOARDS_REPORT_DELETE';
export default async function deleteReport(dispatch, report) {
  dispatch({ type: DASHBOARDS_REPORT_DELETE, reportId: report.id });

  try {
    await core().delete(`/reports/${report.id}`);
  } catch (err) {
    return null;
  }
  return true;
}
