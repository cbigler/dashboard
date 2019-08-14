import showToast from '../../actions/toasts';
import accounts from '../../client/accounts';
import { UserActionTypes } from '../../interfaces/users';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { DensityUser } from '../../types';
import { DispatchType } from '../../interfaces';

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
    dispatch(showToast({
      text: 'Error loading users',
      type: 'error',
    }) as any);
  } else {
    dispatch({
      type: UserActionTypes.USER_MANAGEMENT_USERS_SET,
      users: response.data.map(u => objectSnakeToCamel<DensityUser>(u)),
    });
    return response.users;
  }
}
