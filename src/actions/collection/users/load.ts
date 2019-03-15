import collectionUsersError from './error';
import collectionUsersSet from './set';
import showToast from '../../toasts';
import accounts from '../../../client/accounts';

export const COLLECTION_USERS_LOAD = 'COLLECTION_USERS_LOAD';

export default function collectionUsersLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_LOAD });

    let response, errorThrown;
    try {
      response = await accounts().get('/users');
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionUsersError(errorThrown));
      dispatch(showToast({
        text: 'Error loading users',
        type: 'error',
      }));
    } else {
      dispatch(collectionUsersSet(response.data));
      return response.data;
    }
  }
}
