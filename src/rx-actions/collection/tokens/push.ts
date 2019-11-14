export const COLLECTION_TOKENS_PUSH = 'COLLECTION_TOKENS_PUSH';

export default function collectionTokensPush(item) {
  return { type: COLLECTION_TOKENS_PUSH, item };
}
