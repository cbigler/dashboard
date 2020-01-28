import { userActions } from '..';
import { USER_PUSH } from '../push';
import accounts from '../../../client/accounts';
import { CoreUser } from '@density/lib-api-types/core-v2/users';


export default async function userUpdate(dispatch, full_name: string, phone_number: string) {
  // Set new user details.
  return accounts().put<CoreUser>('/users/me', {
    full_name,
    phone_number,
  }).then(response => {

    const user = response.data;

    // Report success.
    dispatch({ type: USER_PUSH, item: {full_name, phone_number} });
    dispatch(userActions.push(user))
  });
}
