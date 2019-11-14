import {
  DensitySpace,
  DensityTimeSegmentLabel,
  DensitySpaceHierarchyItem,
  DensityDoorway,
  DensityTag,
  DensityAssignedTeam,
} from '../../types';

import fetchAllObjects from '../../helpers/fetch-all-objects';
import spaceManagementSetData from '../space-management/set-data';
import spaceManagementError from '../space-management/error';
import collectionTagsSet from '../collection/tags/set';
import collectionAssignedTeamsSet from '../collection/assigned-teams/set';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

export async function loadData(dispatch) {
  let hierarchy: Array<DensitySpaceHierarchyItem>,
    spaces: Array<DensitySpace>,
    doorways: Array<DensityDoorway>,
    labels: Array<DensityTimeSegmentLabel>,
    tags: Array<DensityTag>,
    assignedTeams: Array<DensityAssignedTeam>;
  try {
    [hierarchy, spaces, doorways, labels, tags, assignedTeams] = await Promise.all([
      await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy', { cache: false }),
      await fetchAllObjects<DensitySpace>('/spaces', { cache: false }),
      await fetchAllObjects<DensityDoorway>('/doorways', { cache: false }),
      await fetchAllObjects<DensityTimeSegmentLabel>('/time_segments/labels', { cache: false }),
      await fetchAllObjects<DensityTag>('/tags', { cache: false }),
      await fetchAllObjects<DensityAssignedTeam>('/assigned_teams', { cache: false }),
    ]);
  } catch (err) {
    console.error(err);
    dispatch(spaceManagementError(err));
    return false;
  }

  dispatch(collectionTagsSet(tags));
  dispatch(collectionAssignedTeamsSet(assignedTeams));
  dispatch(spaceManagementSetData(hierarchy, spaces, doorways, labels));
}

export default async function routeTransitionAdminLocationsEdit(dispatch, spaceId) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
    spaceId,
    setLoading: true,
  });

  await loadData(dispatch);
}
