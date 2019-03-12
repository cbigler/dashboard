import collectionUsersPush from './push';
import collectionUsersError from './error';
import showToast from '../../toasts';
import accounts from '../../../client/accounts';

export const COLLECTION_USERS_UPDATE = 'COLLECTION_USERS_UPDATE';

export default function collectionUsersUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_UPDATE, item });

    try {
      const response = await accounts().put(`/users/${item.id}`, {role: item.role});
      dispatch(collectionUsersPush(response.data));
      dispatch(showToast({
        text: 'User role updated successfully',
      }));
      return response.data;
    } catch (err) {
      dispatch(collectionUsersError(err));
      dispatch(showToast({
        text: 'Error updating user role',
        type: 'danger',
      }));
      return false;
    }
  };
}
