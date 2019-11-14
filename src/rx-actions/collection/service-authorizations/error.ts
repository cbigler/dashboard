export const COLLECTION_SERVICE_AUTHORIZATIONS_ERROR = 'COLLECTION_SERVICE_AUTHORIZATIONS_ERROR';

export default function collectionServiceAuthorizationsError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_SERVICE_AUTHORIZATIONS_ERROR, error};
}
