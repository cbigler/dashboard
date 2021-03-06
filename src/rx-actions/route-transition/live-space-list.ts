import collectionSpacesSet from '../collection/spaces-legacy/set';
import { collectionSpacesBatchSetEvents } from '../collection/spaces-legacy/set-events';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_LIVE_SPACE_LIST = 'ROUTE_TRANSITION_LIVE_SPACE_LIST';

export default async function routeTransitionLiveSpaceList(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_LIVE_SPACE_LIST });

  const spaces = await fetchAllObjects<CoreSpace>('/spaces');
  dispatch(collectionSpacesSet(spaces));

  const spaceEventSets: any = await Promise.all(spaces.map(space => {
    return fetchAllObjects(`/spaces/${space.id}/events`, {
      cache: false,
      params: {
        start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
        end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
      }
    });
  }));

  const eventsAtSpaces = spaceEventSets.reduce((acc, next, index) => {
    acc[spaces[index].id] = next.map(i => ({ 
      countChange: i.direction,
      timestamp: i.timestamp
    }));
    return acc;
  }, {});

  dispatch(collectionSpacesBatchSetEvents(eventsAtSpaces));
}
