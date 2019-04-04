import moment from 'moment';
import core from '../../client/core';
import { DensitySpace } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSet from '../collection/spaces/set';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS = 'ROUTE_TRANSITION_ADMIN_LOCATIONS';

export default function routeTransitionAdminLocations(parentSpaceId) {
  return async (dispatch, getState) => {
    const shouldLoadSpaces = getState().spaces.view !== 'VISIBLE';

    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS,
      parentSpaceId,
      setLoading: shouldLoadSpaces,
    });

    if (shouldLoadSpaces) {
      let spaces;
      try {
        const rawSpaces = await fetchAllPages(async page => {
          const response = await core().get(`/spaces`, {
            params: {
              page,
              page_size: 5000,
            },
          });
          return response.data;
        });
        spaces = rawSpaces.map(d => objectSnakeToCamel<DensitySpace>(d));
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return false;
      }

      dispatch(collectionSpacesSet(spaces));
    }
  };
}
