export const COLLECTION_WEBHOOKS_DELETE = 'COLLECTION_WEBHOOKS_DELETE';

export default function collectionWebhooksDelete(item) {
  return { type: COLLECTION_WEBHOOKS_DELETE, item };
}
