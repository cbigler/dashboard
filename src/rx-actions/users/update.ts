import accounts from '../../client/accounts';
import { UserActionTypes } from '../../types/users';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
import { DispatchType } from '../../types/rx-actions';

export default async function collectionUsersUpdate(dispatch: DispatchType, user) {
  //dispatch({ type: UserManagementActionTypes.USER_MANAGEMENT_USERS_PUSH, user });

  let response, errorThrown;
  try {
    response = await accounts().put(`/users/${user.id}`, {
      role: user.role,
      full_name: user.full_name,
      email: user.email,
      spaces: user.spaces,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error: errorThrown });
    return false;
  } else {
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH,
      user: response.data as CoreUser,
    });
    return true;
  }
}
