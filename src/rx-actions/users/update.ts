import accounts from '../../client/accounts';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { UserActionTypes } from '../../types/users';
import { DensityUser } from '../../types';
import { DispatchType } from '../../types/rx-actions';

export default async function collectionUsersUpdate(dispatch: DispatchType, user) {
  //dispatch({ type: UserManagementActionTypes.USER_MANAGEMENT_USERS_PUSH, user });

  let response, errorThrown;
  try {
    response = await accounts().put(`/users/${user.id}`, {
      role: user.role,
      full_name: user.fullName,
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
      user: objectSnakeToCamel<DensityUser>(response.data),
    });
    return true;
  }
}
