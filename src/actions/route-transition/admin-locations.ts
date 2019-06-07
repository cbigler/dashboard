import { DensitySpace } from '../../types';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSet from '../collection/spaces/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS = 'ROUTE_TRANSITION_ADMIN_LOCATIONS';

export default function routeTransitionAdminLocations(parentSpaceId) {
  return async (dispatch, getState) => {
    const shouldLoadSpaces = getState().spaces.view !== 'VISIBLE' || getState().spaces.data.length <= 1;

    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS,
      parentSpaceId,
      setLoading: shouldLoadSpaces,
    });

    if (shouldLoadSpaces) {
      let spaces;
      try {
        spaces = await fetchAllObjects<DensitySpace>('/spaces');
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return false;
      }

      dispatch(collectionSpacesSet(spaces));
    }
  };
}
