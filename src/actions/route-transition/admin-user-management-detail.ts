export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import collectionUsersError from '../collection/users/error';
import collectionUsersPush from '../collection/users/push';
import collectionSpacesSet from '../collection/spaces/set';
import accounts from '../../client/accounts';
import core from '../../client/core';

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
      spaces = (await fetchAllPages(async page => (
        (await core().get('/spaces/', { params: { page, page_size: 5000 }})).data
      ))).map(objectSnakeToCamel);
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
