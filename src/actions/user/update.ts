import { USER_PUSH } from './push';
import accounts from '../../client/accounts';

export const USER_UPDATE = 'USER_UPDATE';

export default function   userUpdate(fullName, phoneNumber) {
  return (dispatch, getState) => {
    dispatch({ type: USER_UPDATE, fullName });

    // Set new user details.
    return accounts().put('/users/me', {
      full_name: fullName,
      phone_number: phoneNumber
    }).then(() => {
      // Report success.
      dispatch({ type: USER_PUSH, item: {fullName, phoneNumber} });
    });
  };
}
