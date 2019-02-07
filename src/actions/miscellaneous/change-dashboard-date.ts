export const CHANGE_DASHBOARD_DATE = 'CHANGE_DASHBOARD_DATE';

export default function changeDashboardDate(weeks) {
  return { type: CHANGE_DASHBOARD_DATE, weeks };
}
