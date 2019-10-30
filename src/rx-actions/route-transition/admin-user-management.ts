import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import userManagementRead from '../users/read';

export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

export default async function routeTransitionAdminUserManagement(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });

  await userManagementRead(dispatch);

  const hierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy', { cache: false });
  const spaces = await fetchAllObjects<DensitySpace>('/spaces', { cache: false });

  dispatch(collectionSpaceHierarchySet(hierarchy));
  dispatch(collectionSpacesSet(spaces));
}
