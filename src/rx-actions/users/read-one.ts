import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';
import { UserActionTypes } from '../../types/users';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
import { DispatchType } from '../../types/rx-actions';

export default async function collectionUsersReadOne(dispatch: DispatchType, id: string) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_LOAD_ONE, id });

  let response, errorThrown;
  try {
    response = await accounts().get(`/users/${id}`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error: errorThrown });
    showToast(dispatch, {
      text: 'Error loading user',
      type: 'error',
    });
  } else {
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH,
      user: response.data as CoreUser,
    });
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_SET_EDITOR,
      user: response.data as CoreUser,
    });
    return response.data;
  }
}
