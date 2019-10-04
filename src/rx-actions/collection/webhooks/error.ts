export const COLLECTION_WEBHOOKS_ERROR = 'COLLECTION_WEBHOOKS_ERROR';

export default function collectionWebhooksError(error) {
  if (error instanceof Error) {
    error = error.toString();
  }
  return {type: COLLECTION_WEBHOOKS_ERROR, error};
}
