export const COLLECTION_DIGEST_SCHEDULES_PUSH = 'COLLECTION_DIGEST_SCHEDULES_PUSH';

export default function collectionDigestSchedulesPush(item) {
  return { type: COLLECTION_DIGEST_SCHEDULES_PUSH, item };
}
