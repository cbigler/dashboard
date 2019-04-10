import moment from 'moment';
import core from '../../client/core';
import { DensitySpace } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesPush from '../collection/spaces/push';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

export default function routeTransitionAdminLocationsEdit(spaceId) {
  return async (dispatch, getState) => {
    const space = getState().spaces.data.find(space => space.id === spaceId);

    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
      spaceId,
      setLoading: !space,
    });

    if (!space) {
      let space;
      try {
        const response = await core().get(`/spaces/${spaceId}`);
        const space = objectSnakeToCamel<DensitySpace>(response.data);
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return false;
      }

      dispatch(collectionSpacesPush(space));
    }
  };
}
