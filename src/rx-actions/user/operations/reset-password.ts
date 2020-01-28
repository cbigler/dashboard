import { userActions } from '..';
import sessionTokenSet from '../../session-token/set';
import accounts from '../../../client/accounts';


export default async function userResetPassword(dispatch, email: string, current: string, password: string) {
  dispatch(userActions.resetPasswordStart(password));

  try {
    // Set the new password.
    await accounts().post('/users/me/password', {
      old_password: current,
      new_password: password,
      confirm_password: password,
    });

    // Fetch a new access token with new password.
    const response = await accounts().post('/login', { email, password });
    sessionTokenSet(dispatch, response.data);

    // Report success.
    dispatch(userActions.resetPasswordSuccess());
  } catch (err) {
    // Failure while resetting password.
    dispatch(userActions.error(err));
  }
}
