export const COLLECTION_SERVICE_SPACES_ERROR = 'COLLECTION_SERVICE_SPACES_ERROR';

export default function collectionServiceSpacesError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SERVICE_SPACES_ERROR, error};
}
