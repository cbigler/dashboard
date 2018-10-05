import moment from 'moment';
import { core } from '../../client';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesSetEvents from '../collection/spaces/set-events';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionLinksSet from '../collection/links/set';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';

export const ROUTE_TRANSITION_LIVE_SPACE_LIST = 'ROUTE_TRANSITION_LIVE_SPACE_LIST';

export default function routeTransitionLiveSpaceList() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LIVE_SPACE_LIST });

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

      // Then, fetch all initial events for each space.
      // This is used to populate each space's events collection with all the events from the last
      // minute so that the real time event charts all display as "full" when the page reloads.
      return Promise.all(spaces.results.map(space => {
        const localTimeAtSpace = getCurrentLocalTimeAtSpace(space);
        return core.spaces.events({
          id: space.id,
          start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
          end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
        });
      })).then(spaceEventSets => {
        spaceEventSets.forEach((spaceEventSet, ct) => {
          dispatch(collectionSpacesSetEvents(spaces.results[ct], spaceEventSet.results.map(i => ({
            countChange: i.direction,
            timestamp: i.timestamp,
          }))));
        });
      });
    });
  };
}
