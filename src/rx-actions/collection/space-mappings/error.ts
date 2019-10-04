export const COLLECTION_SPACE_MAPPINGS_ERROR = 'COLLECTION_SPACE_MAPPINGS_ERROR';

export default function collectionSpaceMappingsError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SPACE_MAPPINGS_ERROR, error};
}
