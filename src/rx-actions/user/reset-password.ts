import sessionTokenSet from '../session-token/set';
import userError from './error';
import accounts from '../../client/accounts';

export const USER_RESET_PASSWORD = 'USER_RESET_PASSWORD';
export const USER_RESET_PASSWORD_SUCCESS = 'USER_RESET_PASSWORD_SUCCESS';

export default async function userResetPassword(dispatch, email, current, password) {
  dispatch({ type: USER_RESET_PASSWORD, password });

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
    dispatch({ type: USER_RESET_PASSWORD_SUCCESS });
  } catch (err) {
    // Failure while resetting password.
    dispatch(userError(err));
  }
}
