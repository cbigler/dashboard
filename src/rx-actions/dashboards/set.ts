export const DASHBOARDS_SET = 'DASHBOARDS_SET';

export default function dashboardsSet(segments) {
  return { type: DASHBOARDS_SET, data: segments };
}
