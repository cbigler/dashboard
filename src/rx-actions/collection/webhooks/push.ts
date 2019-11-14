export const COLLECTION_WEBHOOKS_PUSH = 'COLLECTION_WEBHOOKS_PUSH';

export default function collectionWebhooksPush(item) {
  return { type: COLLECTION_WEBHOOKS_PUSH, item };
}
