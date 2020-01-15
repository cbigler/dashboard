import { USER_PUSH } from './push';
import accounts from '../../client/accounts';

export const USER_UPDATE = 'USER_UPDATE';

export default async function userUpdate(dispatch, full_name, phone_number) {
  dispatch({ type: USER_UPDATE, full_name });

  // Set new user details.
  return accounts().put('/users/me', {
    full_name,
    phone_number,
  }).then(() => {
    // Report success.
    dispatch({ type: USER_PUSH, item: {full_name, phone_number} });
  });
}
