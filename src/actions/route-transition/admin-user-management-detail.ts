export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL';

import collectionUsersError from '../collection/users/error';
import collectionUsersPush from '../collection/users/push';
import collectionSpacesSet from '../collection/spaces/set';
import accounts from '../../client/accounts';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace } from '../../types';

export default function routeTransitionAdminUserManagementDetail(id) {
  return async dispatch => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL,
      id,
      setLoading: true,
    });

    let user, spaces, errorThrown = null;
    try {
      user = await accounts().get(`/users/${id}`);
      spaces = await fetchAllObjects<DensitySpace>('/spaces');
    } catch (e) {
      errorThrown = e;
    }

    if (errorThrown) {
      dispatch(collectionUsersError(errorThrown));
    } else {
      dispatch(collectionUsersPush(user.data));
      dispatch(collectionSpacesSet(spaces));
    }
  };
}
