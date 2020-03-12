import collectionWebhooksPush from './push';
import collectionWebhooksError from './error';
import core from '../../../client/core';

export const COLLECTION_WEBHOOKS_UPDATE = 'COLLECTION_WEBHOOKS_UPDATE';

export default async function collectionWebhooksUpdate(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_UPDATE, item });

  try {
    const response = await core().put(`/webhooks/${item.id}`, {
      type: item.type,
      name: item.name,
      description: item.description,
      endpoint: item.endpoint,
      headers: item.headers,
      enabled: item.enabled,
    });
    dispatch(collectionWebhooksPush(response.data));
    return response.data;
  } catch (err) {
    dispatch(collectionWebhooksError(err));
    return false;
  }
}
