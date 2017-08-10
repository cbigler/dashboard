export const COLLECTION_SPACES_ERROR = 'COLLECTION_SPACES_ERROR';

export default function collectionSpacesError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SPACES_ERROR, error};
}
