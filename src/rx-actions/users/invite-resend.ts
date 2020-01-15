import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';

import { UserActionTypes } from '../../types/users';
import { DispatchType } from '../../types/rx-actions';
import { CoreUser, CoreUserInvitationStatus } from '@density/lib-api-types/core-v2/users';

export default async function usersInviteResend(dispatch: DispatchType, user: CoreUser) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_INVITE_RESEND, user });

  try {
    await accounts().put(`/users/invite/resend/${user.id}`);
    user.invitation_status = CoreUserInvitationStatus.PENDING;
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH, user });
    showToast(dispatch, {
      text: 'Invite sent successfully',
    });
    return user;
  } catch (err) {
    dispatch({type: UserActionTypes.USER_MANAGEMENT_ERROR, error: err});
    showToast(dispatch, {
      text: 'Error sending invite',
      type: 'error',
    });
    return false;
  }
}
