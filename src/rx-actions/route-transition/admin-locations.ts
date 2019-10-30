import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

import { DensitySpace, DensityDoorway } from '../../types';

import spaceManagementSetDoorways from '../space-management/set-doorways';
import spaceManagementError from '../space-management/error';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS = 'ROUTE_TRANSITION_ADMIN_LOCATIONS';

export async function loadData(dispatch) {
  let spaces: Array<DensitySpace>,
    doorways: Array<DensityDoorway>;
  try {
    [spaces, doorways] = await Promise.all([
      await fetchAllObjects<DensitySpace>('/spaces', { cache: false }),
      await fetchAllObjects<DensityDoorway>('/doorways', { cache: false }),
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
