import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import fetchAllPages from '../../helpers/fetch-all-pages/index';
import core from '../../client/core';

import { DensitySpace } from '../../types';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import convertSpacesToSpaceTree from '../../helpers/convert-spaces-to-space-tree/index';

export const ROUTE_TRANSITION_EXPLORE = 'ROUTE_TRANSITION_EXPLORE';

function returnSpaceOrFirstChild(space) {
  if (space.children && space.children.length > 0) {
    return returnSpaceOrFirstChild(space.children[0])
  } else {
    return space
  }
}

export default function routeTransitionExplore() {  
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_EXPLORE });
    let errorThrown;

    // immediately bring them to the first space trends page if we have spaces
    let state = getState()
    const currentSpaces = state.spaces.data;
    if (currentSpaces.length > 0) {
      const spaceTree = convertSpacesToSpaceTree(currentSpaces)
      const firstSpace = returnSpaceOrFirstChild(spaceTree[0])
      if (firstSpace) {
        window.location.href = `#/spaces/explore/${firstSpace.id}/trends`;  
      }  
    }

    // Load a list of all spaces
    errorThrown = false;
    let spaces;
    try {
      spaces = (await fetchAllPages(
        async page => (await core().get('/spaces', {params: {page, page_size: 5000}})).data
      )).map(s => objectSnakeToCamel<DensitySpace>(s));
    } catch (err) {
      errorThrown = true;
      dispatch(collectionSpacesError(`Error loading space: ${err}`));
    }
    if (!errorThrown) {
      dispatch(collectionSpacesSet(spaces));
    }

    // if there were no current spaces, then now that we have a list, let's bring them to the first...
    if (currentSpaces.length == 0) {
      const spaceTree = convertSpacesToSpaceTree(spaces)
      const firstSpace = returnSpaceOrFirstChild(spaceTree[0])
      if (firstSpace) {
        window.location.href = `#/spaces/explore/${firstSpace.id}/trends`;  
      }  
    }

  }
}
