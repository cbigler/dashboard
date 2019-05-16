import moment from 'moment';
import core from '../../client/core';
import { DensitySpace, DensityTimeSegmentLabel } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';
import spaceManagementSetData from '../../actions/space-management/set-data';
import spaceManagementError from '../../actions/space-management/error';

import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

async function getHierarchy() {
  return (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
}

async function getSpaces() {
  const spacesRaw = await fetchAllPages(async page => (
    await core().get('/spaces', {params: {page_size: 5000, page}})
  ).data)
  return spacesRaw.map(i => objectSnakeToCamel<DensitySpace>(i));
}

async function getLabels() {
  const labelsRaw = await fetchAllPages(async page => (
    await core().get('/time_segments/labels', {params: {page_size: 5000, page}})
  ).data)
  return labelsRaw.map(i => objectSnakeToCamel<DensityTimeSegmentLabel>(i));
}

export default function routeTransitionAdminLocationsEdit(spaceId) {
  return async (dispatch, getState) => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
      spaceId,
      setLoading: true,
    });

    let spaces, hierarchy, labels;
    try {
      [spaces, hierarchy, labels] = await Promise.all([
        getSpaces(),
        getHierarchy(),
        getLabels(),
      ]);
    } catch (err) {
      console.error(err);
      dispatch(spaceManagementError(err));
      return false;
    }

    dispatch(spaceManagementSetData(spaces, hierarchy, labels));
  };
}
