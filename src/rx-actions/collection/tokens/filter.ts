export const COLLECTION_TOKENS_FILTER = 'COLLECTION_TOKENS_FILTER';

export default function collectionTokensFilter(filter, value) {
  return { type: COLLECTION_TOKENS_FILTER, filter, value };
}
