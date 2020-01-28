import { CoreSpace, CoreSpaceType } from '@density/lib-api-types/core-v2/spaces';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from './admin-locations';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from './admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from './admin-locations-edit';

export function adminLocations(parentSpaceId: string) {
  return {
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS,
    setLoading: true,
    parentSpaceId,
  }    
}

export function adminLocationsNew(parentSpaceId: CoreSpace['id'], newSpaceType: CoreSpaceType) {
  return {
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
    space_id: parentSpaceId,
    setLoading: true,
    space_type: newSpaceType,
    parentSpaceId,
  }
}

export function adminLocationsEdit(space_id: CoreSpace['id']) {
  return {
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
    setLoading: true,
    space_id,
  }
}