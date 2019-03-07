export const COLLECTION_USERS_PUSH = 'COLLECTION_USERS_PUSH';

export default function collectionUsersPush(item) {
  return { type: COLLECTION_USERS_PUSH, item };
}
