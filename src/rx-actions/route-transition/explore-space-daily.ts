import moment from 'moment';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesFilter from '../collection/spaces/filter';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';

import core from '../../client/core';
import { getGoSlow } from '../../components/environment-switcher/index';

import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';

import exploreDataCalculateDataLoading from '../explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../explore-data/calculate-data-error';

import {
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
} from '../../helpers/space-time-utilities/index';

import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments/index';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import collectionAlertsRead from '../alerts/read';
import SpacesStore from '../../rx-stores/spaces';

export const ROUTE_TRANSITION_EXPLORE_SPACE_DAILY = 'ROUTE_TRANSITION_EXPLORE_SPACE_DAILY';

export default async function routeTransitionExploreSpaceDaily(dispatch, id) {
  // Prior to changing the active page, change the module state to be loading.
  dispatch(exploreDataCalculateDataLoading('footTraffic', null));

  // Change the active page
  dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_DAILY, id });

  // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
  // every space to traverse through the space hierarchy and render a list of parent spaces on
  // this view unfortunately.
  let spaces, spaceHierarchy, selectedSpace;
  try {
    spaceHierarchy = await fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false });
    spaces = await fetchAllObjects<CoreSpace>('/spaces', { cache: false });
    selectedSpace = spaces.find(s => s.id === id);
  } catch (err) {
    dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
    return;
  }

  await collectionAlertsRead(dispatch);

  dispatch(collectionSpaceHierarchySet(spaceHierarchy));
  dispatch(collectionSpacesSet(spaces));
  dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));

  // FIXME: yikes
  let spacesState = SpacesStore.imperativelyGetValue();
  dispatch(collectionSpacesFilter('date', spacesState.filters.date));

  await calculate(dispatch, selectedSpace);
}

export async function calculate(dispatch, space) {
  await calculateFootTraffic(dispatch, space);
  await calculateDailyRawEvents(dispatch, space);
}

export async function calculateFootTraffic(dispatch, space) {
  // Mark the foot traffic card as in a loading state
  dispatch(exploreDataCalculateDataLoading('footTraffic', null));

  const spaces = SpacesStore.imperativelyGetValue();
  const {
    date,
    timeSegmentLabel,
  } = spaces.filters

  const day = parseISOTimeAtSpace(date, space);

  let data;
  try {
    data = (await fetchAllObjects(`/spaces/${space.id}/counts`, {
      cache: false,
      params: {
        interval: '5m',
        time_segment_labels: timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL ? undefined : timeSegmentLabel,
        order: 'asc',
        start_time: formatInISOTimeAtSpace(day.clone().startOf('day'), space),
        end_time: formatInISOTimeAtSpace(day.clone().startOf('day').add(1, 'day'), space),
        slow: getGoSlow(),
      }
    })).reverse();
  } catch (err) {
    dispatch(exploreDataCalculateDataError('footTraffic', `Error fetching count data: ${err}`));
    return;
  }

  if (data.length > 0) {
    dispatch(exploreDataCalculateDataComplete('footTraffic', data));
  } else {
    dispatch(exploreDataCalculateDataComplete('footTraffic', null));
  }
}

export const DAILY_RAW_EVENTS_PAGE_SIZE = 10;

export async function calculateDailyRawEvents(dispatch, space) {
  // Mark the foot traffic card as in a loading state
  dispatch(exploreDataCalculateDataLoading('dailyRawEvents', null));

  const spaces = SpacesStore.imperativelyGetValue();
  const {
    date,
    dailyRawEventsPage,
    timeSegmentLabel,
  } = spaces.filters;

  // Add timezone offset to both start and end times prior to querying for the count.
  const day = parseISOTimeAtSpace(date, space);

  let preResponse;
  try {
    // Fetch a single page here, so don't use the helper
    preResponse = await core().get(`/spaces/${space.id}/events`, {params: {
      start_time: formatInISOTimeAtSpace(day.clone().startOf('day'), space),
      end_time: formatInISOTimeAtSpace(day.clone().startOf('day').add(1, 'day'), space),
      time_segment_labels: timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL ? undefined : timeSegmentLabel,
      page: dailyRawEventsPage,
      page_size: DAILY_RAW_EVENTS_PAGE_SIZE,
      order: 'desc',
    }});
  } catch (error) {
    dispatch(exploreDataCalculateDataError('dailyRawEvents', `Error fetching event data: ${error}`));
    return;
  }

  // No results returned? Show a special state.
  if (preResponse.data.results.length === 0) {
    dispatch(exploreDataCalculateDataComplete('dailyRawEvents', { data: null }));
    return;
  }

  // Convert all keys in the response to camelcase. Also, reverse data so it is ordered from
  const data = preResponse.data.results
    .sort((a, b) => moment.utc(b.timestamp).valueOf() - moment.utc(a.timestamp).valueOf());

  // Calculate a unique array of all doorways that are referenced by each event that was
  // returned.
  const uniqueArrayOfDoorways = data.reduce((acc, item) => {
    if (acc.indexOf(item.doorway_id) === -1) {
      return [...acc, item.doorway_id];
    } else {
      return acc;
    }
  }, []);

  // Fetch information about each doorway in each event, if the doorway information isn't
  // already known.
  const doorwayRequests = uniqueArrayOfDoorways.map(async doorway_id => {
    try {
      return await fetchObject<CoreDoorway>(`/doorways/${doorway_id}`, {
        cache: false,
        params: { environment: 'true' }
      });
    } catch (error) {
      dispatch(exploreDataCalculateDataError('dailyRawEvents', error));
      return;
    }
  });

  const doorwayResponses = await Promise.all(doorwayRequests);

  // Add all the new doorways to the state.
  const doorwayLookup = {};
  uniqueArrayOfDoorways.forEach((id, index) => {
    doorwayLookup[id] = doorwayResponses[index];
  });

  // Update the state to reflect that the data fetching is complete.
  dispatch(exploreDataCalculateDataComplete('dailyRawEvents', {
    data,
    doorwayLookup,

    total: preResponse.data.total,
    nextPageAvailable: Boolean(preResponse.data.next),
    previousPageAvailable: Boolean(preResponse.data.previous),
  }));
};

