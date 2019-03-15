import { accounts } from '../../../client';
import collectionUsersPush from './push';
import collectionUsersError from './error';
import showToast from '../../toasts';
import mixpanelTrack from '../../../helpers/mixpanel-track/index';


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

      mixpanelTrack('User Invited', {
        email: item.email,
        role: item.role,
      });

      return response;
    } catch (err) {
      // Don't store this error in the error collection for the space, since we are showing a toast
      // for it instead.
      dispatch(showToast({
        text: 'Error creating user',
        type: 'error',
      }));
      return false;
    }
  };
}
