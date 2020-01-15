import { showToast } from '../../rx-actions/toasts';
import accounts from '../../client/accounts';
import { UserActionTypes } from '../../types/users';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
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
      users: response.data as Array<CoreUser>,
    });
  }
}
