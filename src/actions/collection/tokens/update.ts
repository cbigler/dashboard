import collectionTokensPush from './push';
import collectionTokensError from './error';
import accounts from '../../../client/accounts';

export const COLLECTION_TOKENS_UPDATE = 'COLLECTION_TOKENS_UPDATE';

export default function collectionTokensUpdate(token) {
  return async dispatch => {
    dispatch({ type: COLLECTION_TOKENS_UPDATE, token });

    try {
      const response = await accounts().put('/tokens', {
        name: token.name,
        description: token.description,
        token_type: token.tokenType,
        key: token.key,
      });
      dispatch(collectionTokensPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionTokensError(err));
      return false;
    }
  };
}
