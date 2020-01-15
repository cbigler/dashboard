import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';

import spaceManagementSetDoorways from '../space-management/set-doorways';
import spaceManagementError from '../space-management/error';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS = 'ROUTE_TRANSITION_ADMIN_LOCATIONS';

export async function loadData(dispatch) {
  let spaces: Array<CoreSpace>,
    doorways: Array<CoreDoorway>;
  try {
    [spaces, doorways] = await Promise.all([
      await fetchAllObjects<CoreSpace>('/spaces', { cache: false }),
      await fetchAllObjects<CoreDoorway>('/doorways', {
        cache: false,
        params: { environment: 'true' }
      }),
    ]);
  } catch (err) {
    console.error(err);
    dispatch(spaceManagementError(err));
    return false;
  }
  dispatch(spaceManagementSetDoorways(doorways));
  dispatch(collectionSpacesSet(spaces));
}

export default async function routeTransitionAdminLocations(dispatch, parentSpaceId) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS,
    parentSpaceId,
    setLoading: true,
  });

  await loadData(dispatch);
}
