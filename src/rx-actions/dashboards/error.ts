export const DASHBOARDS_ERROR = 'DASHBOARDS_ERROR';

export default function dashboardsError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: DASHBOARDS_ERROR, error};
}
