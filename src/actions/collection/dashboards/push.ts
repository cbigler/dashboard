export const COLLECTION_DASHBOARDS_PUSH = 'COLLECTION_DASHBOARDS_PUSH';

export default function collectionDashboardsPush(item) {
  return { type: COLLECTION_DASHBOARDS_PUSH, item };
}
