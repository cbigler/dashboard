export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import collectionUsersSet from '../collection/users/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import accounts from '../../client/accounts';
import core from '../../client/core';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace } from '../../types';

export default function routeTransitionAdminUserManagement() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });
    const usersResponse = await accounts().get('/users');
    const hierarchy = (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
    const spaces = await fetchAllObjects<DensitySpace>('/spaces');
    dispatch(collectionUsersSet(usersResponse.data));
    dispatch(collectionSpaceHierarchySet(hierarchy));
    dispatch(collectionSpacesSet(spaces));
  };
}
