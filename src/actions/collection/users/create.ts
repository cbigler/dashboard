import { accounts } from '../../../client';
import collectionUsersPush from './push';
import collectionUsersError from './error';
import showToast from '../../toasts';

export const COLLECTION_USERS_CREATE = 'COLLECTION_USERS_CREATE';

export default function collectionUsersCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_CREATE, item });

    try {
      const response = await accounts.users.invite({
        email: item.email,
        role: item.role,
      });
      dispatch(collectionUsersPush(response));
      dispatch(showToast({
        text: 'User successfully created',
      }));
      return response;
    } catch (err) {
      dispatch(collectionUsersError(err));
      dispatch(showToast({
        text: 'Error creating user',
        type: 'danger',
      }));
      return false;
    }
  };
}
