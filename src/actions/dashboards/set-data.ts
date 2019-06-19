export const DASHBOARDS_SET_DATA = 'DASHBOARDS_SET_DATA';

export default function dashboardsSetData(
  dashboard,
  reportList,
  timeSegmentLabels,
) {
  return {
    type: DASHBOARDS_SET_DATA,
    dashboard,
    reportList,
    timeSegmentLabels,
  };
}
