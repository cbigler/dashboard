export const COLLECTION_SERVICES_ERROR = 'COLLECTION_SERVICES_ERROR';

export default function collectionServicesError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SERVICES_ERROR, error};
}
