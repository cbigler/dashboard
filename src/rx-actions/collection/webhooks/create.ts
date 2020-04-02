import collectionWebhooksPush from './push';
import core from '../../../client/core';
import { showToast } from '../../toasts';

export const COLLECTION_WEBHOOKS_CREATE = 'COLLECTION_WEBHOOKS_CREATE';

export default async function collectionWebhooksCreate(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_CREATE, item });

  let response;
  try {
    response = await core().post('/webhooks', {
      type: item.type,
      name: item.name,
      description: item.description,
      endpoint: item.endpoint,
      headers: item.headers,
    });
  } catch (err) {
    showToast(dispatch, { type: 'error', text: 'Error creating webhook.' });
    return false;
  }

  dispatch(collectionWebhooksPush(response.data));
  showToast(dispatch, { text: 'Created Webhook.' });
  return response.data;
}

