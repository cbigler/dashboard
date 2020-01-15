import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { CoreTimeSegmentLabel } from '@density/lib-api-types/core-v2/time_segments';
import { DensityTag, DensityAssignedTeam } from '../../types';

import fetchAllObjects from '../../helpers/fetch-all-objects';
import spaceManagementSetData from '../space-management/set-data';
import spaceManagementError from '../space-management/error';
import collectionTagsSet from '../collection/tags/set';
import collectionAssignedTeamsSet from '../collection/assigned-teams/set';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

export async function loadData(dispatch) {
  let hierarchy: Array<CoreSpaceHierarchyNode>,
    spaces: Array<CoreSpace>,
    doorways: Array<CoreDoorway>,
    labels: Array<CoreTimeSegmentLabel>,
    tags: Array<DensityTag>,
    assigned_teams: Array<DensityAssignedTeam>;
  try {
    [hierarchy, spaces, doorways, labels, tags, assigned_teams] = await Promise.all([
      await fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false }),
      await fetchAllObjects<CoreSpace>('/spaces', { cache: false }),
      await fetchAllObjects<CoreDoorway>('/doorways', {
        cache: false,
        params: { environment: 'true' }
      }),
      await fetchAllObjects<CoreTimeSegmentLabel>('/time_segments/labels', { cache: false }),
      await fetchAllObjects<DensityTag>('/tags', { cache: false }),
      await fetchAllObjects<DensityAssignedTeam>('/assigned_teams', { cache: false }),
    ]);
  } catch (err) {
    console.error(err);
    dispatch(spaceManagementError(err));
    return false;
  }

  dispatch(collectionTagsSet(tags));
  dispatch(collectionAssignedTeamsSet(assigned_teams));
  dispatch(spaceManagementSetData(hierarchy, spaces, doorways, labels));
}

export default async function routeTransitionAdminLocationsEdit(dispatch, space_id) {
  dispatch({
    type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
    space_id,
    setLoading: true,
  });

  await loadData(dispatch);
}
