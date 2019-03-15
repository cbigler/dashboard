import { accounts } from '../../client';
import userSet from '../user/set';
import userError from '../user/error';

export const SESSION_TOKEN_SET = 'SESSION_TOKEN_SET';

export default function sessionTokenSet(token) {
  return dispatch => {
    dispatch({ type: SESSION_TOKEN_SET, token });

    // Fetch new user information and update the stored user.
    return accounts.users.me({token}).then(data => data).catch(err => {
      dispatch(userError(err));
    }).then(data => {
      dispatch(userSet(data));
      return data;
    });
  }
}
