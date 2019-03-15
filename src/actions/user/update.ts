import { USER_PUSH } from './push';
import accounts from '../../client/accounts';

export const USER_UPDATE = 'USER_UPDATE';

export default function userUpdate(fullName, nickname, marketingConsent) {
  return (dispatch, getState) => {
    dispatch({ type: USER_UPDATE, fullName, nickname, marketingConsent });

    // Set new user details.
    return accounts().put('/users/me', {
      full_name: fullName,
      nickname: nickname,
      marketing_consent: marketingConsent,
    }).then(() => {
      // Report success.
      dispatch({ type: USER_PUSH, item: {fullName, nickname, marketingConsent} });
    });
  };
}
