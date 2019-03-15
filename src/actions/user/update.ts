import { accounts } from '../../client';
import { USER_PUSH } from './push';

export const USER_UPDATE = 'USER_UPDATE';

export default function userUpdate(fullName, nickname, marketingConsent) {
  return (dispatch, getState) => {
    dispatch({ type: USER_UPDATE, fullName, nickname, marketingConsent });

    // Set new user details.
    return accounts.users.update({
      full_name: fullName,
      nickname: nickname,
      marketing_consent: marketingConsent,
    }).then(() => {
      // Report success.
      dispatch({ type: USER_PUSH, item: {fullName, nickname, marketingConsent} });
    });
  };
}
