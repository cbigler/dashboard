import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';
import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import collectionAlertsLoad from '../collection/alerts/load';

export const ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT = 'ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT';

export default function routeTransitionExploreSpaceDataExport(id) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT, id });

    try {
      const spaceHierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
      const spaces = await fetchAllObjects<DensitySpace>('/spaces');
      const selectedSpace = spaces.find(s => s.id === id);
      await dispatch(collectionAlertsLoad());
      dispatch(collectionSpaceHierarchySet(spaceHierarchy));
      dispatch(collectionSpacesSet(spaces));
      dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading spaces: ${err}`));
    }
  }
}
