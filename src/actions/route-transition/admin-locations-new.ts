import moment from 'moment';
import core from '../../client/core';
import { DensitySpace } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';
import setNewSpaceType from '../miscellaneous/set-new-space-type';
import setNewSpaceParentId from '../miscellaneous/set-new-space-parent-id';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW';

export default function routeTransitionAdminLocationsNew(parentSpaceId, newSpaceType) {
  return async (dispatch, getState) => {
    // Store the new space type and space parent somewhere so we can access it in the component later.
    dispatch(setNewSpaceType(newSpaceType));
    dispatch(setNewSpaceParentId(parentSpaceId));

    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      spaceId: parentSpaceId,
      setLoading: true,
      parentSpaceId,
      spaceType: newSpaceType,
    });

    // Load a list of all time segment groups, which is required in order to render in the time
    // segment list.
    let response;
    try {
      response = await core().get('/time_segment_groups', {params: {page_size: 5000}});
    } catch (err) {
      dispatch(collectionTimeSegmentGroupsError(`Error loading time segments: ${err.message}`));
      return;
    }
    dispatch(collectionTimeSegmentGroupsSet(response.data.results));

    let hierarchy;
    try {
      hierarchy = (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
    dispatch(collectionSpaceHierarchySet(hierarchy));

    let spaces;
    try {
      const spacesRaw = await fetchAllPages(async page => (
        await core().get('/spaces', {params: {page_size: 5000, page}})
      ).data)
      spaces = spacesRaw.map(i => objectSnakeToCamel<DensitySpace>(i));
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
    dispatch(collectionSpacesSet(spaces));

    dispatch({
      type: 'SPACE_MANAGEMENT_SET_DATA',
      spaces,
      hierarchy,
      labels: [],
    });
  };
}
