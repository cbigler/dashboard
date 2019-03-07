export const COLLECTION_USERS_ERROR = 'COLLECTION_USERS_ERROR';

export default function collectionUsersError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return { type: COLLECTION_USERS_ERROR, error };
}
