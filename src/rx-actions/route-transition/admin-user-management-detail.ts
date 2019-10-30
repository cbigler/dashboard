import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import { UserActionTypes } from '../../types/users';
import userManagementReadOne from '../users/read-one';

export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL';


export default async function routeTransitionAdminUserManagementDetail(dispatch, id) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL,
    id,
    setLoading: true,
  });

  await userManagementReadOne(dispatch, id);

  let hierarchy, spaces, errorThrown = null;
  try {
    hierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy', { cache: false });
    spaces = await fetchAllObjects<DensitySpace>('/spaces', { cache: false });
  } catch (e) {
    errorThrown = e;
  }

  if (errorThrown) {
    dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error: errorThrown });
  } else {
    dispatch(collectionSpaceHierarchySet(hierarchy));
    dispatch(collectionSpacesSet(spaces));
  }
}
