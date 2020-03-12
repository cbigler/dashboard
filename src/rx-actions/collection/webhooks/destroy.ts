import collectionWebhooksDelete from './delete';
import core from '../../../client/core';

import { showToast } from '../../toasts';

export const COLLECTION_WEBHOOKS_DESTROY = 'COLLECTION_WEBHOOKS_DESTROY';

export default async function collectionWebhooksDestroy(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_DESTROY, item });

  try {
    await core().delete(`/webhooks/${item.id}`);
  } catch (err) {
    showToast(dispatch, { type: 'error', text: 'Error deleting webhook.' });
    return false;
  }

  showToast(dispatch, { text: 'Deleted webhook.' });
  dispatch(collectionWebhooksDelete(item));
  return true;
}
