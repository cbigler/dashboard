import collectionWebhooksPush from './push';
import { core } from '../../../client';
import collectionWebhooksError from './error';

export const COLLECTION_WEBHOOKS_UPDATE = 'COLLECTION_WEBHOOKS_UPDATE';

export default function collectionWebhooksUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_WEBHOOKS_UPDATE, item });

    try {
      const response = await core.webhooks.update({
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
