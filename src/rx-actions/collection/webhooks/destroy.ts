import collectionWebhooksDelete from './delete';
import collectionWebhooksError from './error';
import core from '../../../client/core';

export const COLLECTION_WEBHOOKS_DESTROY = 'COLLECTION_WEBHOOKS_DESTROY';

export default async function collectionWebhooksDestroy(dispatch, item) {
  dispatch({ type: COLLECTION_WEBHOOKS_DESTROY, item });

  try {
    await core().delete(`/webhooks/${item.id}`);
    dispatch(collectionWebhooksDelete(item));
    return true;
  } catch (err) {
    dispatch(collectionWebhooksError(err));
    return false;
  }
}
