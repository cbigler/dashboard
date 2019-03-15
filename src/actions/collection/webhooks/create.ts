import collectionWebhooksPush from './push';
import collectionWebhooksError from './error';
import core from '../../../client/core';

export const COLLECTION_WEBHOOKS_CREATE = 'COLLECTION_WEBHOOKS_CREATE';

export default function collectionWebhooksCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_WEBHOOKS_CREATE, item });

    try {
      const response = await core().post('/webhooks', {
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
      });
      dispatch(collectionWebhooksPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionWebhooksError(err));
      return false;
    }
  };
}

