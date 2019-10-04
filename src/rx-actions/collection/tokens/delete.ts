export const COLLECTION_TOKENS_DELETE = 'COLLECTION_TOKENS_DELETE';

export default function collectionTokensDelete(item) {
  return { type: COLLECTION_TOKENS_DELETE, item };
}
