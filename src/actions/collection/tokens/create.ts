import collectionTokensPush from './push';
import { accounts } from '../../../client';
import collectionTokensError from './error';

export const COLLECTION_TOKENS_CREATE = 'COLLECTION_TOKENS_CREATE';

export default function collectionTokensCreate(token) {
  return async dispatch => {
    dispatch({ type: COLLECTION_TOKENS_CREATE, token });

    try {
      const response = await accounts.tokens.create({
        name: token.name,
        description: token.description,
        token_type: token.tokenType,
      });
      dispatch(collectionTokensPush(response));
      return response;
    } catch (err) {
      dispatch(collectionTokensError(err));
      return false;
    }
  };
}
