export const SET_DASHBOARD_DATE = 'SET_DASHBOARD_DATE';
export const SCRUB_DASHBOARD_DATE = 'SCRUB_DASHBOARD_DATE';

export default function setDashboardDate(date) {
  return { type: SET_DASHBOARD_DATE, date };
}

export function scrubDashboardDate(weeks) {
  return { type: SCRUB_DASHBOARD_DATE, weeks };
}
