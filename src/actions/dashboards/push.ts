export const DASHBOARDS_PUSH = 'DASHBOARDS_PUSH';

export default function dashboardsPush(item) {
  return { type: DASHBOARDS_PUSH, item };
}
