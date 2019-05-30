import core from '../../client/core';
import { DensitySpace, DensityTimeSegmentLabel, DensityDoorway, DensityTag, DensityAssignedTeam } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import spaceManagementSetData from '../space-management/set-data';
import spaceManagementError from '../space-management/error';
import collectionTagsSet from '../collection/tags/set';
import collectionAssignedTeamsSet from '../collection/assigned-teams/set';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW';

async function getHierarchy() {
  return (await core().get('/spaces/hierarchy/')).data.map(objectSnakeToCamel);
}

async function getSpaces() {
  const spacesRaw = await fetchAllPages(async page => (
    await core().get('/spaces', {params: {page_size: 5000, page}})
  ).data)
  return spacesRaw.map(i => objectSnakeToCamel<DensitySpace>(i));
}

async function getDoorways() {
  const doorwaysRaw = await fetchAllPages(async page => (
    await core().get('/doorways', {params: {page_size: 5000, page}})
  ).data)
  return doorwaysRaw.map(i => objectSnakeToCamel<DensityDoorway>(i));
}

async function getTimeSegmentLabels(): Promise<Array<DensityTimeSegmentLabel>> {
  // NOTE: DensityTimeSegmentLabel's aren't objects, so I didn't use objectSnakeToCamel here.
  return fetchAllPages(async page => (
    await core().get('/time_segments/labels', {params: {page_size: 5000, page}})
  ).data);
}

async function getTags() {
  const tagsRaw = await fetchAllPages(async page => (
    await core().get('/tags', {params: {page_size: 5000, page}})
  ).data)
  return tagsRaw.map(i => objectSnakeToCamel<DensityTag>(i));
}

async function getAssignedTeams() {
  const assignedTeamsRaw = await fetchAllPages(async page => (
    await core().get('/assigned_teams', {params: {page_size: 5000, page}})
  ).data)
  return assignedTeamsRaw.map(i => objectSnakeToCamel<DensityAssignedTeam>(i));
}

export default function routeTransitionAdminLocationsNew(parentSpaceId, newSpaceType) {
  return async (dispatch, getState) => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      spaceId: parentSpaceId,
      setLoading: true,
      parentSpaceId,
      spaceType: newSpaceType,
    });

    let spaces, hierarchy, doorways, labels, tags, assignedTeams;
    try {
      [spaces, hierarchy, doorways, labels, tags, assignedTeams] = await Promise.all([
        getSpaces(),
        getHierarchy(),
        getDoorways(),
        getTimeSegmentLabels(),
        getTags(),
        getAssignedTeams(),
      ]);
    } catch (err) {
      console.error(err);
      dispatch(spaceManagementError(err));
      return false;
    }

    dispatch(collectionTagsSet(tags));
    dispatch(collectionAssignedTeamsSet(assignedTeams));
    dispatch(spaceManagementSetData(spaces, hierarchy, doorways, labels));
  };
}
