import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces-legacy/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import userManagementRead from '../users/read';

export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT';

export default async function routeTransitionAdminUserManagement(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT });

  await userManagementRead(dispatch);

  const hierarchy = await fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false });
  const spaces = await fetchAllObjects<CoreSpace>('/spaces', { cache: false });

  dispatch(collectionSpaceHierarchySet(hierarchy));
  dispatch(collectionSpacesSet(spaces));
}
