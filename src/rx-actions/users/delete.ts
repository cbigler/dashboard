import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';

import { UserActionTypes } from '../../types/users';
import { DispatchType } from '../../types/rx-actions';
import { DensityUser } from '../../types';

export default async function collectionUsersDelete(dispatch: DispatchType, user: DensityUser) {
  //dispatch({ type: UserManagementActionTypes.USER_MANAGEMENT_USERS_REMOVE, user });

  try {
    await accounts().delete(`/users/${user.id}`);
  } catch (error) {
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error });
    showToast(dispatch, {
      text: 'Error deleting user',
      type: 'error',
    });
    console.error(error);
    return false;
  }

  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_REMOVE, user });
  showToast(dispatch, {
    text: 'User deleted successfully',
  });
  return true;
}
