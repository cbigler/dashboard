import { core } from '../../client';

import collectionSpacesSet from '../collection/spaces/set';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionLinksSet from '../collection/links/set';

export const ROUTE_TRANSITION_ENVIRONMENT_SPACE = 'ROUTE_TRANSITION_ENVIRONMENT_SPACE';

export default function routeTransitionEnvironment() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ENVIRONMENT_SPACE });

    return Promise.all([
      // Fetch a list of all spaces.
      core.spaces.list(),
      // Fetch a list of all doorways.
      core.doorways.list({environment: true}),
      // Fetch a list of all links.
      core.links.list(),
    ]).then(([spaces, doorways, links]) => {
      dispatch(collectionSpacesSet(spaces.results));
      dispatch(collectionDoorwaysSet(doorways.results));
      dispatch(collectionLinksSet(links.results));
    });
  };
}
