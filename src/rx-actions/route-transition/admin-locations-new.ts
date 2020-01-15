import { loadData } from './admin-locations-edit';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW';

export default async function routeTransitionAdminLocationsNew(dispatch, parentSpaceId, newSpaceType) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
    space_id: parentSpaceId,
    setLoading: true,
    parentSpaceId,
    space_type: newSpaceType,
  });

  loadData(dispatch);
}
