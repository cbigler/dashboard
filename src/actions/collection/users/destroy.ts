import collectionUsersDelete from './delete';
import collectionUsersError from './error';
import showToast from '../../toasts';
import accounts from '../../../client/accounts';

export const COLLECTION_USERS_DESTROY = 'COLLECTION_USERS_DESTROY';

export default function collectionUsersDestroy(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_DESTROY, item });

    try {
      await accounts().delete(`/users/${item.id}`);
    } catch (err) {
      dispatch(collectionUsersError(err));
      dispatch(showToast({
        text: 'Error deleting user',
        type: 'error',
      }));
      console.error(err);
      return false;
    }

    dispatch(collectionUsersDelete(item));
    dispatch(showToast({
      text: 'User deleted successfully',
    }));
    return true;
  };
}
