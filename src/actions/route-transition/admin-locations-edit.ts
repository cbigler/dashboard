import core from '../../client/core';
import { DensitySpace, DensityTimeSegmentLabel, DensitySpaceHierarchyItem } from '../../types';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';
import spaceManagementSetData from '../../actions/space-management/set-data';
import spaceManagementError from '../../actions/space-management/error';

export const ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT = 'ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT';

async function getHierarchy() {
  return (await core().get('/spaces/hierarchy/')).data.map(i => (
    objectSnakeToCamel<DensitySpaceHierarchyItem>(i)
  ));
}

async function getSpaces() {
  const spacesRaw = await fetchAllPages(async page => (
    await core().get('/spaces', {params: {page_size: 5000, page}})
  ).data)
  return spacesRaw.map(i => objectSnakeToCamel<DensitySpace>(i));
}

async function getLabels(): Promise<Array<DensityTimeSegmentLabel>> {
  // NOTE: DensityTimeSegmentLabel's aren't objects, so I didn't use objectSnakeToCamel here.
  return fetchAllPages(async page => (
    await core().get('/time_segments/labels', {params: {page_size: 5000, page}})
  ).data);
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
