export const COLLECTION_TOKENS_SET = 'COLLECTION_TOKENS_SET';

export default function collectionTokensSet(tokens) {
  return { type: COLLECTION_TOKENS_SET, data: tokens };
}
