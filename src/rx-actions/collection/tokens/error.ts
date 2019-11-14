export const COLLECTION_TOKENS_ERROR = 'COLLECTION_TOKENS_ERROR';

export default function collectionTokensError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_TOKENS_ERROR, error};
}
