import { CoreUser } from '@density/lib-api-types/core-v2/users';
import { UserActionTypes } from '../../types/users';

import accounts from '../../client/accounts';
import { showToast } from '../../rx-actions/toasts';

import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import getBackendErrorDetail from '../../helpers/get-backend-error-detail';
import { DispatchType } from '../../types/rx-actions';

export default async function userManagementCreate(dispatch: DispatchType, user) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_CREATE, user });

  let response;
  try {
    response = await accounts().post('/users/invite', {
      email: user.email,
      role: user.role,
      spaces: user.space_ids,
    });
  } catch (err) {
    // Don't store this error in the error collection for the space, since we are showing a toast
    // for it instead.
    if (
      err.response.status === 400 &&
      getBackendErrorDetail(err) === 'User with this email already invited'
    ) {
      showToast(dispatch, {
        text: 'User with this email already exists',
        type: 'error',
      });
    } else {
      showToast(dispatch, {
        text: 'Error creating user',
        type: 'error',
      });
    }
    return false;
  }

  dispatch({
    type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH,
    user: response.data as CoreUser
  });
  showToast(dispatch, {
    text: 'User successfully created',
  });

  mixpanelTrack('User Invited', {
    email: user.email,
    role: user.role,
  });

  return response.data;
}
