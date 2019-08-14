import { DensityUser } from '../../types';
import { UserActionTypes } from '../../interfaces/users';

import accounts from '../../client/accounts';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import showToast from '../../actions/toasts';

import mixpanelTrack from '../../helpers/mixpanel-track/index';
import getBackendErrorDetail from '../../helpers/get-backend-error-detail';
import { DispatchType } from '../../interfaces';

export default async function userManagementCreate(dispatch: DispatchType, user) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_CREATE, user });

  let response;
  try {
    response = await accounts().post('/users/invite', {
      email: user.email,
      role: user.role,
      spaces: user.spaceIds,
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
      }) as any);
    } else {
      dispatch(showToast({
        text: 'Error creating user',
        type: 'error',
      }) as any);
    }
    return false;
  }

  dispatch({
    type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH,
    user: objectSnakeToCamel<DensityUser>(response.data)
  });
  dispatch(showToast({
    text: 'User successfully created',
  }) as any);

  mixpanelTrack('User Invited', {
    email: user.email,
    role: user.role,
  });

  return response.data;
}
