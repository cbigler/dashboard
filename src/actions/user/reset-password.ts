import { accounts } from '../../client';
import sessionTokenSet from '../session-token/set';
import userError from './error';

export const USER_RESET_PASSWORD = 'USER_RESET_PASSWORD';
export const USER_RESET_PASSWORD_SUCCESS = 'USER_RESET_PASSWORD_SUCCESS';

export default function userResetPassword(current, password) {
  return async (dispatch, getState) => {
    dispatch({ type: USER_RESET_PASSWORD, password });

    try {
      // Set the new password.
      await accounts.users.password({
        old_password: current,
        new_password: password,
        confirm_password: password,
      });

      // Fetch a new access token with new password.
      const token = await accounts.users.login({
        email: getState().user.data.email,
        password,
      });
      dispatch(sessionTokenSet(token));

      // Report success.
      dispatch({ type: USER_RESET_PASSWORD_SUCCESS });
    } catch (err) {
      // Failure while resetting password.
      dispatch(userError(err));
    }
  };
}
