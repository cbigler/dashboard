export const COLLECTION_ALERTS_ERROR = 'COLLECTION_ALERTS_ERROR';

export default function collectionAlertsError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.message;
  }
  return { type: COLLECTION_ALERTS_ERROR, error };
}
