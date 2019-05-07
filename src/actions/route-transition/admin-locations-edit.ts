import moment from 'moment';
import core from '../../client/core';
import { DensitySpace, DensityTimeSegmentGroup } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesPush from '../collection/spaces/push';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

export default function routeTransitionAdminLocationsEdit(spaceId) {
  return async (dispatch, getState) => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
      spaceId,
      setLoading: true,
    });


    if (getState().spaceHierarchy.data.length === 0) {
      let hierarchy;
      try {
        hierarchy = (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return false;
      }
      dispatch(collectionSpaceHierarchySet(hierarchy));
    }

    let timeSegmentGroups;

    try {
      const timeSegmentGroupsRaw = await fetchAllPages(async page => (
        await core().get('/time_segment_groups', {params: {page_size: 5000, page}})
      ).data)
      timeSegmentGroups = timeSegmentGroupsRaw.map(i => objectSnakeToCamel<DensityTimeSegmentGroup>(i));
    } catch (err) {
      console.error(err);
      dispatch(collectionTimeSegmentGroupsError(err));
      return false;
    }
    dispatch(collectionTimeSegmentGroupsSet(timeSegmentGroups));

    let space, hierarchy;
    try {
      const response = await core().get(`/spaces/${spaceId}`);
      space = objectSnakeToCamel<DensitySpace>(response.data);
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
    dispatch(collectionSpacesPush(space));
  };
}
