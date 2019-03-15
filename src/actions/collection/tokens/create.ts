import collectionTokensPush from './push';
import collectionTokensError from './error';
import accounts from '../../../client/accounts';

export const COLLECTION_TOKENS_CREATE = 'COLLECTION_TOKENS_CREATE';

export default function collectionTokensCreate(token) {
  return async dispatch => {
    dispatch({ type: COLLECTION_TOKENS_CREATE, token });

    try {
      const response = await accounts().post('/tokens', {
        name: token.name,
        description: token.description,
        token_type: token.tokenType,
      });
      dispatch(collectionTokensPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionTokensError(err));
      return false;
    }
  };
}
