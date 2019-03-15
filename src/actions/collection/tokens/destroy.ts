import collectionTokensDelete from './delete';
import collectionTokensError from './error';
import accounts from '../../../client/accounts';

export const COLLECTION_TOKENS_DESTROY = 'COLLECTION_TOKENS_DESTROY';

export default function collectionTokensDestroy(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_TOKENS_DESTROY, item });
    try {
      await accounts().delete('/tokens', {
        data: { key: item.key }
      });
    } catch (err) {
      dispatch(collectionTokensError(err));
      return false;
    }

    dispatch(collectionTokensDelete(item));
    return true;
  };
}
