export const COLLECTION_WEBHOOKS_FILTER = 'COLLECTION_WEBHOOKS_FILTER';

export default function collectionWebhooksFilter(filter, value) {
  return { type: COLLECTION_WEBHOOKS_FILTER, filter, value };
}
