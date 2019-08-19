import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import { UserActionTypes } from '../../types/users';
import userManagementReadOne from '../../rx-actions/users/read-one';

export const ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL = 'ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL';


export default function routeTransitionAdminUserManagementDetail(id) {
  return async dispatch => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL,
      id,
      setLoading: true,
    });

    await userManagementReadOne(dispatch, id);

    let hierarchy, spaces, errorThrown = null;
    try {
      hierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
      spaces = await fetchAllObjects<DensitySpace>('/spaces');
    } catch (e) {
      errorThrown = e;
    }

    if (errorThrown) {
      dispatch({ type: UserActionTypes.USER_MANAGEMENT_ERROR, error: errorThrown });
    } else {
      dispatch(collectionSpaceHierarchySet(hierarchy));
      dispatch(collectionSpacesSet(spaces));
    }
  };
}
