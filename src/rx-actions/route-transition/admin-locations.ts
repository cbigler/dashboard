import { DensitySpace } from '../../types';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS = 'ROUTE_TRANSITION_ADMIN_LOCATIONS';

export default async function routeTransitionAdminLocations(dispatch, parentSpaceId) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS,
    parentSpaceId,
    setLoading: true,
  });

  let spaces;
  try {
    spaces = await fetchAllObjects<DensitySpace>('/spaces');
  } catch (err) {
    dispatch(collectionSpacesError(err));
    // return false;
  }
  dispatch(collectionSpacesSet(spaces));
}
