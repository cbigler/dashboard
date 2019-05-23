import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import core from '../../client/core';

import collectionSpacesSet from '../collection/spaces/set';
import { collectionSpacesBatchSetEvents } from '../collection/spaces/set-events';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';

import { DensitySpace } from '../../types';

export const ROUTE_TRANSITION_LIVE_SPACE_LIST = 'ROUTE_TRANSITION_LIVE_SPACE_LIST';

export default function routeTransitionLiveSpaceList() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LIVE_SPACE_LIST });

    return core().get('/spaces').then(spaces => {
      dispatch(collectionSpacesSet(spaces.data.results));

      // Then, fetch all initial events for each space.
      // This is used to populate each space's events collection with all the events from the last
      // minute so that the real time event charts all display as "full" when the page reloads.
      return Promise.all(spaces.data.results.map(s => {
      const space = objectSnakeToCamel<DensitySpace>(s);
        return core().get(`/spaces/${space.id}/events`, { params: {
          id: space.id,
          start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
          end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
        }});
      })).then((spaceEventSets: any) => {
        const eventsAtSpaces = spaceEventSets.reduce((acc, next, index) => {
          acc[spaces.data.results[index].id] = next.data.results.map(i => ({ 
            countChange: i.direction,
            timestamp: i.timestamp
          }));
          return acc;
        }, {});
        dispatch(collectionSpacesBatchSetEvents(eventsAtSpaces));
      });
    });
  };
}
