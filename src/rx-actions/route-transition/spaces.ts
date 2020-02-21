import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import sortSpaceTree from '../../helpers/sort-space-tree/index';

import { spaceActions } from '../spaces';
import spacesError from '../collection/spaces-legacy/error';
import spaceHierarchySet from '../collection/space-hierarchy/set';

export const ROUTE_TRANSITION_SPACES = 'ROUTE_TRANSITION_SPACES';

function getFirstLeafSpace(space) {
  if (space.children && space.children.length > 0) {
    return getFirstLeafSpace(space.children[0])
  } else {
    return space
  }
}

export default async function routeTransitionSpaces(dispatch) {  
  let errorThrown = false, spaces, spaceHierarchy;
  dispatch({ type: ROUTE_TRANSITION_SPACES });

  // Load all spaces and the hierarchy, which is fairly wasteful
  try {
    spaceHierarchy = await fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false });
    spaces = await fetchAllObjects<CoreSpace>('/spaces', { cache: false });
  } catch (err) {
    errorThrown = true;
    dispatch(spacesError(`Error loading spaces: ${err}`));
  }
  if (!errorThrown) {
    dispatch(spaceHierarchySet(spaceHierarchy));
    dispatch(spaceActions.setAll(spaces));
  }

  const spaceTree = sortSpaceTree(spaceHierarchy);
  const initialSpace = getFirstLeafSpace(spaceTree[0]);
  if (initialSpace) {
    window.location.href = `#/spaces/${initialSpace.id}`;
  }
}
