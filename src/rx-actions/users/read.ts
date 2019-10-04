import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';
import { UserActionTypes } from '../../types/users';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { DensityUser } from '../../types';
import { DispatchType } from '../../types/rx-actions';

export default async function collectionUsersLoad(dispatch: DispatchType) {
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_LOAD });

  let response, errorThrown;
  try {
    response = await accounts().get('/users');
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error: errorThrown });
    showToast(dispatch, {
      text: 'Error loading users',
      type: 'error',
    });
  } else {
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_USERS_SET,
      users: response.data.map(u => objectSnakeToCamel<DensityUser>(u)),
    });
  }
}
