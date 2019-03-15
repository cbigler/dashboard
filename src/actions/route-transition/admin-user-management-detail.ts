export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL';

import collectionUsersError from '../collection/users/error';
import collectionUsersPush from '../collection/users/push';
import { accounts } from '../../client';

export default function routeTransitionAdminUserManagementDetail(id) {
  return async (dispatch, getState) => {
    const userAlreadyExists = getState().users.data.find(user => user.id === id);
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL,
      id,
      setLoading: !userAlreadyExists,
    });

    if (!userAlreadyExists) {
      let user, errorThrown = null;
      try {
        user = await accounts().get(`/users/${id}`);
      } catch (e) {
        errorThrown = e;
      }

      if (errorThrown) {
        dispatch(collectionUsersError(errorThrown));
      } else {
        dispatch(collectionUsersPush(user));
      }
    }
  };
}
