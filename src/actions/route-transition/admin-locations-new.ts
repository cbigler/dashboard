import core from '../../client/core';
import { DensitySpace, DensityTimeSegmentLabel, DensityDoorway, DensityTag, DensityAssignedTeam } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import spaceManagementSetData from '../space-management/set-data';
import spaceManagementError from '../space-management/error';
import collectionTagsSet from '../collection/tags/set';
import collectionAssignedTeamsSet from '../collection/assigned-teams/set';

import { loadData } from './admin-locations-edit';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW';

export default function routeTransitionAdminLocationsNew(parentSpaceId, newSpaceType) {
  return async (dispatch, getState) => {
    dispatch({
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      spaceId: parentSpaceId,
      setLoading: true,
      parentSpaceId,
      spaceType: newSpaceType,
    });

    dispatch(loadData());
  };
}
