import moment from 'moment';
import core from '../../client/core';
import { DensitySpace } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesPush from '../collection/spaces/push';
import setNewSpaceType from '../miscellaneous/set-new-space-type';
import setNewSpaceParentId from '../miscellaneous/set-new-space-parent-id';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW';

export default function routeTransitionAdminLocationsNew(parentSpaceId, newSpaceType) {
  return async (dispatch, getState) => {
    const space = parentSpaceId && getState().spaces.data.find(space => space.id === parentSpaceId);

    // Store the new space type and space parent somewhere so we can access it in the component later.
    dispatch(setNewSpaceType(newSpaceType));
    dispatch(setNewSpaceParentId(parentSpaceId));

    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      spaceId: parentSpaceId,
      setLoading: parentSpaceId && !space,
    });

    if (!space && parentSpaceId) {
      let space;
      try {
        const response = await core().get(`/spaces/${parentSpaceId}`);
        space = objectSnakeToCamel<DensitySpace>(response.data);
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return false;
      }

      dispatch(collectionSpacesPush(space));
    }
  };
}
