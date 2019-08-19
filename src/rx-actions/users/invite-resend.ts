import showToast from '../../actions/toasts';
import accounts from '../../client/accounts';

import { UserActionTypes } from '../../types/users';
import { DispatchType } from '../../types/rx-actions';
import { DensityUser } from '../../types';

export default async function usersInviteResend(dispatch: DispatchType, user: DensityUser) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_INVITE_RESEND, user });

  try {
    await accounts().put(`/users/invite/resend/${user.id}`);
    user.invitationStatus = 'pending';
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH, user });
    dispatch(showToast({
      text: 'Invite sent successfully',
    }) as any);
    return user;
  } catch (err) {
    dispatch({type: UserActionTypes.USER_MANAGEMENT_ERROR, error: err});
    dispatch(showToast({
      text: 'Error sending invite',
      type: 'error',
    }) as any);
    return false;
  }
}
