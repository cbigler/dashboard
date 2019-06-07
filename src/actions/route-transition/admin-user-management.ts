export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

import collectionUsersSet from '../collection/users/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import accounts from '../../client/accounts';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';

export default function routeTransitionAdminUserManagement() {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });
    const usersResponse = await accounts().get('/users');
    const hierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
    const spaces = await fetchAllObjects<DensitySpace>('/spaces');
    dispatch(collectionUsersSet(usersResponse.data));
    dispatch(collectionSpaceHierarchySet(hierarchy));
    dispatch(collectionSpacesSet(spaces));
  };
}
