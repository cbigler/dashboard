export const COLLECTION_DIGEST_SCHEDULES_ERROR = 'COLLECTION_DIGEST_SCHEDULES_ERROR';

export default function collectionDigestSchedulesError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.message;
  }
  return { type: COLLECTION_DIGEST_SCHEDULES_ERROR, error };
}
