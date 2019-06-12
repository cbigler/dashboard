import collectionUsersPush from './push';
import collectionUsersError from './error';
import accounts from '../../../client/accounts';

export const COLLECTION_USERS_UPDATE = 'COLLECTION_USERS_UPDATE';

export default function collectionUsersUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_UPDATE, item });

    let response, errorThrown;
    try {
      response = await accounts().put(`/users/${item.id}`, {
        role: item.role,
        full_name: item.fullName,
        email: item.email,
        spaces: item.spaces,
      });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(collectionUsersError(errorThrown));
      return false;
    } else {
      dispatch(collectionUsersPush(response));
      return true;
    }
  };
}
