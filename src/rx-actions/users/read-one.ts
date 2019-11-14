import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';
import { UserActionTypes } from '../../types/users';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { DensityUser } from '../../types';
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
      user: objectSnakeToCamel<DensityUser>(response.data),
    });
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_SET_EDITOR,
      user: objectSnakeToCamel<DensityUser>(response.data),
    });
    return response.data;
  }
}
