export const COLLECTION_USERS_LOAD = 'COLLECTION_USERS_LOAD';

import { accounts } from '../../../client';
import collectionUsersError from './error';
import collectionUsersSet from './set';

export default function collectionUsersLoad() {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_LOAD });

    let users, errorThrown;
    try {
      users = await accounts.users.list();
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.error(errorThrown);
      dispatch(collectionUsersError(errorThrown));
    } else {
      dispatch(collectionUsersSet(users));
    }
  }
}
