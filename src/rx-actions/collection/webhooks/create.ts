import collectionWebhooksPush from './push';
import collectionWebhooksError from './error';
import core from '../../../client/core';

export const COLLECTION_WEBHOOKS_CREATE = 'COLLECTION_WEBHOOKS_CREATE';

export default async function collectionWebhooksCreate(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_CREATE, item });

  try {
    const response = await core().post('/webhooks', {
      type: item.type,
      name: item.name,
      description: item.description,
      endpoint: item.endpoint,
      headers: item.headers,
    });
    dispatch(collectionWebhooksPush(response.data));
    return response.data;
  } catch (err) {
    dispatch(collectionWebhooksError(err));
    return false;
  }
}

