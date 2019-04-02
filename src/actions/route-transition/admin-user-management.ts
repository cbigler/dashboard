export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import collectionUsersSet from '../collection/users/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import accounts from '../../client/accounts';
import core from '../../client/core';

export default function routeTransitionAdminUserManagement() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });
    const usersResponse = await accounts().get('/users');
    const hierarchy = (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
    const spaces = (await fetchAllPages(async page => (
      (await core().get('/spaces/', { params: { page, page_size: 5000 }})).data
    ))).map(objectSnakeToCamel);
    dispatch(collectionUsersSet(usersResponse.data));
    dispatch(collectionSpaceHierarchySet(hierarchy));
    dispatch(collectionSpacesSet(spaces));
  };
}
