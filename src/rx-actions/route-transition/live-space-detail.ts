import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

import collectionSpacesPush from '../collection/spaces-legacy/push';
import collectionSpacesError from '../collection/spaces-legacy/error';
import collectionSpacesSetEvents from '../collection/spaces-legacy/set-events';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces-legacy/set-default-time-range';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';

export const ROUTE_TRANSITION_LIVE_SPACE_DETAIL = 'ROUTE_TRANSITION_LIVE_SPACE_DETAIL';

export default async function routeTransitionLiveSpaceDetail(dispatch, id) {
  try {
    const space = await fetchObject<CoreSpace>(`/spaces/${id}`, { cache: false });
    dispatch(collectionSpacesPush(space));
    dispatch({ type: ROUTE_TRANSITION_LIVE_SPACE_DETAIL, id });
    dispatch(collectionSpacesSetDefaultTimeRange(space));

    // Fetch all initial events for the space that was loaded.
    // This is used to populate this space's events collection with all the events from the last
    // minute so that the real time event charts all display as "full" when the page reloads.
    const spaceEventSet = await fetchAllObjects<CoreSpaceEvent>(`/spaces/${space.id}/events`, {
      cache: false,
      params: {
        id: space.id,
        start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
        end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
      }
    });
    dispatch(collectionSpacesSetEvents(space, spaceEventSet.map(i => ({
      countChange: i.direction,
      timestamp: i.timestamp,
    }))));
  } catch (err) {
    dispatch(collectionSpacesError(`Error loading space live detail page: ${err}`));
  }
}
