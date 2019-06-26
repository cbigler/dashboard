export const COLLECTION_ALERTS_PUSH = 'COLLECTION_ALERTS_PUSH';

export default function collectionAlertsPush(item) {
  return { type: COLLECTION_ALERTS_PUSH, item };
}
