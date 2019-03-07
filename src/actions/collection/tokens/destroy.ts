import collectionTokensDelete from './delete';
import { accounts } from '../../../client';
import collectionTokensError from './error';

export const COLLECTION_TOKENS_DESTROY = 'COLLECTION_TOKENS_DESTROY';

export default function collectionTokensDestroy(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_TOKENS_DESTROY, item });

    let response;
    try {
      response = await accounts.tokens.delete({key: item.key});
    } catch (err) {
      dispatch(collectionTokensError(err));
      return false;
    }

    dispatch(collectionTokensDelete(item));
    return true;
  };
}
