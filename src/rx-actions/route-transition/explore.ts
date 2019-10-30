import fetchAllObjects from '../../helpers/fetch-all-objects';

import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import sortSpaceTree from '../../helpers/sort-space-tree/index';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';

export const ROUTE_TRANSITION_EXPLORE = 'ROUTE_TRANSITION_EXPLORE';

function returnSpaceOrFirstChild(space) {
  if (space.children && space.children.length > 0) {
    return returnSpaceOrFirstChild(space.children[0])
  } else {
    return space
  }
}

export default async function routeTransitionExplore(dispatch) {  
  dispatch({ type: ROUTE_TRANSITION_EXPLORE });
  let errorThrown;

  const spaceHierarchyState = SpaceHierarchyStore.imperativelyGetValue();
  // immediately bring them to the first space trends page if we have spaces
  const currentSpaces = spaceHierarchyState.data;
  if (currentSpaces.length > 0) {
    const spaceTree = sortSpaceTree(currentSpaces);
    const firstSpace = returnSpaceOrFirstChild(spaceTree[0]);
    if (firstSpace) {
      window.location.href = `#/spaces/${firstSpace.id}/trends`;  
    }  
  }

  // Load a list of all spaces
  errorThrown = false;
  let spaces, spaceHierarchy;
  try {
    spaceHierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy', { cache: false });
    spaces = await fetchAllObjects<DensitySpace>('/spaces', { cache: false });
  } catch (err) {
    errorThrown = true;
    dispatch(collectionSpacesError(`Error loading spaces: ${err}`));
  }
  if (!errorThrown) {
    dispatch(collectionSpaceHierarchySet(spaceHierarchy));
    dispatch(collectionSpacesSet(spaces));
  }

  // if there were no current spaces, then now that we have a list, let's bring them to the first...
  if (currentSpaces.length === 0) {
    const spaceTree = sortSpaceTree(spaceHierarchy);
    const firstSpace = returnSpaceOrFirstChild(spaceTree[0]);
    if (firstSpace) {
      window.location.href = `#/spaces/${firstSpace.id}/trends`;  
    }  
  }
}
