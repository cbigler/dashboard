import { accounts } from '../../../client';
import collectionUsersPush from './push';
import collectionUsersError from './error';
import showToast from '../../toasts';

export const COLLECTION_USERS_UPDATE = 'COLLECTION_USERS_UPDATE';

export default function collectionUsersUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_UPDATE, item });

    try {
      const response = await accounts.users.update({
        id: item.id,
        role: item.role,
      });
      dispatch(collectionUsersPush(response));
      dispatch(showToast({
        text: 'User role updated successfully',
      }));
      return response;
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
