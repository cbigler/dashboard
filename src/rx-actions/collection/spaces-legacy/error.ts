export const COLLECTION_SPACES_ERROR = 'COLLECTION_SPACES_ERROR';

export default function collectionSpacesError(error: Error | string) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SPACES_ERROR, error} as const;
}
