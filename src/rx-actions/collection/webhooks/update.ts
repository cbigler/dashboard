import collectionWebhooksPush from './push';
import core from '../../../client/core';

import { showToast } from '../../toasts';
export const COLLECTION_WEBHOOKS_UPDATE = 'COLLECTION_WEBHOOKS_UPDATE';

export default async function collectionWebhooksUpdate(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_UPDATE, item });

  let response;
  try {
    response = await core().put(`/webhooks/${item.id}`, {
      type: item.type,
      name: item.name,
      description: item.description,
      endpoint: item.endpoint,
      headers: item.headers,
      enabled: item.enabled,
    });
  } catch (err) {
    showToast(dispatch, { type: 'error', text: 'Error updating webhook.' });
    return false;
  }

  dispatch(collectionWebhooksPush(response.data));
  showToast(dispatch, { text: 'Updated Webhook.' });
  return response.data;
}
