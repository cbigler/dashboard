export const COLLECTION_USERS_DELETE = 'COLLECTION_USERS_DELETE';

export default function collectionUsersDelete(item) {
  return { type: COLLECTION_USERS_DELETE, item };
}
