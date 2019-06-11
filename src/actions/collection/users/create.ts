import collectionUsersPush from './push';
import showToast from '../../toasts';
import mixpanelTrack from '../../../helpers/mixpanel-track/index';
import accounts from '../../../client/accounts';
import getBackendErrorDetail from '../../../helpers/get-backend-error-detail';

export const COLLECTION_USERS_CREATE = 'COLLECTION_USERS_CREATE';

export default function collectionUsersCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_CREATE, item });

    let response;
    try {
      response = await accounts().post('/users/invite', {
        email: item.email,
        role: item.role,
        spaces: item.spaceIds,
      });
    } catch (err) {
      // Don't store this error in the error collection for the space, since we are showing a toast
      // for it instead.
      if (
        err.response.status === 400 &&
        getBackendErrorDetail(err) === 'User with this email already invited'
      ) {
        dispatch(showToast({
          text: 'User with this email already exists',
          type: 'error',
        }));
      } else {
        dispatch(showToast({
          text: 'Error creating user',
          type: 'error',
        }));
      }
      return false;
    }

    dispatch(collectionUsersPush(response.data));
    dispatch(showToast({
      text: 'User successfully created',
    }));

    mixpanelTrack('User Invited', {
      email: item.email,
      role: item.role,
    });

    return response.data;
  };
}
