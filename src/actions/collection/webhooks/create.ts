import collectionWebhooksPush from './push';
import { core } from '../../../client';
import collectionWebhooksError from './error';

export const COLLECTION_WEBHOOKS_CREATE = 'COLLECTION_WEBHOOKS_CREATE';

export default function collectionWebhooksCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_WEBHOOKS_CREATE, item });

    try {
      const response = await core.webhooks.create({
        id: item.id,
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
      });
      dispatch(collectionWebhooksPush(response));
      return response;
    } catch (err) {
      dispatch(collectionWebhooksError(err));
      return false;
    }
  };
}

