import collectionWebhooksDelete from './delete';
import collectionWebhooksError from './error';
import core from '../../../client/core';

export const COLLECTION_WEBHOOKS_DESTROY = 'COLLECTION_WEBHOOKS_DESTROY';

export default function collectionWebhooksDestroy(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_WEBHOOKS_DESTROY, item });

    try {
      await core().delete(`/webhooks/${item.id}`);
      dispatch(collectionWebhooksDelete(item));
      return true;
    } catch (err) {
      dispatch(collectionWebhooksError(err));
      return false;
    }
  };
}
