import { core } from '../../client';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import collectionSpacesPush from '../collection/spaces/push';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSetEvents from '../collection/spaces/set-events';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';

export const ROUTE_TRANSITION_LIVE_SPACE_DETAIL = 'ROUTE_TRANSITION_LIVE_SPACE_DETAIL';

export default function routeTransitionLiveSpaceDetail(id) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LIVE_SPACE_DETAIL, id });

    try {
      const space: any = objectSnakeToCamel(await core.spaces.get({id}));
      dispatch(collectionSpacesPush(space));
      dispatch(collectionSpacesSetDefaultTimeRange(space));

      // Fetch all initial events for the space that was loaded.
      // This is used to populate this space's events collection with all the events from the last
      // minute so that the real time event charts all display as "full" when the page reloads.
      const spaceEventSet = await core.spaces.events({
        id: space.id,
        start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
        end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
      });
      dispatch(collectionSpacesSetEvents(space, spaceEventSet.results.map(i => ({
        countChange: i.direction,
        timestamp: i.timestamp,
      }))));
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space live detail page: ${err}`));
    }
  };
}
