import { loadData } from './admin-locations-edit';
import { CoreSpaceType, CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW' as const;

export default async function routeTransitionAdminLocationsNew(dispatch, parentSpaceId: CoreSpace['id'] | null, newSpaceType: CoreSpaceType) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
    space_id: parentSpaceId,
    setLoading: true,
    parentSpaceId,
    space_type: newSpaceType,
  });

  loadData(dispatch);
}
