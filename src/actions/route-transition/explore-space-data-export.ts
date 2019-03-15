import { core } from '../../client';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';

import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';

export const ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT = 'ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT';

export default function routeTransitionExploreSpaceDataExport(id) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT, id });

    try {
      const spaces = await core.spaces.list();
      const selectedSpace = spaces.results.find(s => s.id === id);
      dispatch(collectionSpacesSet(spaces.results));
      dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading spaces: ${err}`));
    }
  }
}
