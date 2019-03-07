export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

import collectionUsersSet from '../collection/users/set';
import { accounts } from '../../client';

export default function routeTransitionAdminUserManagement() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });
    const users = await accounts.users.list();
    dispatch(collectionUsersSet(users));
  };
}
