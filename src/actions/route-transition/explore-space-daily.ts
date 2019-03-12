import moment from 'moment';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesFilter from '../collection/spaces/filter';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';
import core from '../../client/core';
import { getGoSlow } from '../../components/environment-switcher/index';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../actions/explore-data/calculate-data-error';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
} from '../../helpers/space-time-utilities/index';

import { DEFAULT_TIME_SEGMENT_GROUP } from '../../helpers/time-segments/index';

export const ROUTE_TRANSITION_EXPLORE_SPACE_DAILY = 'ROUTE_TRANSITION_EXPLORE_SPACE_DAILY';

export default function routeTransitionExploreSpaceDaily(id) {
  return async dispatch => {
    // Prior to changing the active page, change the module state to be loading.
    dispatch(exploreDataCalculateDataLoading('footTraffic', null));

    // Change the active page
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_DAILY, id });

    // Load a list of all time segment groups, which is required in order to render in the time
    // segment list.
    let response;
    try {
      response = await core().get('/time_segment_groups', {params: {page_size: 5000}});
    } catch (err) {
      dispatch(collectionTimeSegmentGroupsError(`Error loading time segments: ${err.message}`));
      return;
    }
    dispatch(collectionTimeSegmentGroupsSet(response.data.results));

    // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
    // every space to traverse through the space hierarchy and render a list of parent spaces on
    // this view unrfortunately.
    let spaces, selectedSpace;
    try {
      spaces = (await fetchAllPages(
        page => core().get('/spaces', {params: {page, page_size: 5000}})
      )).map(objectSnakeToCamel);
      selectedSpace = spaces.find(s => s.id === id);
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
      return;
    }

    dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));
    dispatch(collectionSpacesSet(spaces));

    dispatch(collectionSpacesFilter(
      'date',
      formatInISOTimeAtSpace(getCurrentLocalTimeAtSpace(selectedSpace).startOf('day'), selectedSpace),
    ));

    dispatch(calculate(selectedSpace));
  }
}

export function calculate(space) {
  return dispatch => {
    dispatch(calculateFootTraffic(space));
    dispatch(calculateDailyRawEvents(space));
  };
}

export function calculateFootTraffic(space) {
  return async (dispatch, getState) => {
    // Mark the foot traffic card as in a loading state
    dispatch(exploreDataCalculateDataLoading('footTraffic', null));

    const {
      date,
      timeSegmentGroupId,
    } = getState().spaces.filters

    const day = parseISOTimeAtSpace(date, space);

    let data;
    try {
      data = (await fetchAllPages(page => (
        core().get(`/spaces/${space.id}/counts`, { params: {
          interval: '5m',
          time_segment_groups: timeSegmentGroupId === DEFAULT_TIME_SEGMENT_GROUP.id ? undefined : timeSegmentGroupId,
          order: 'asc',

          start_time: formatInISOTimeAtSpace(day.clone().startOf('day'), space),
          end_time: formatInISOTimeAtSpace(day.clone().startOf('day').add(1, 'day'), space),

          page,
          page_size: 5000,
          slow: getGoSlow(),
        }})
      ))).reverse();
    } catch (err) {
      dispatch(exploreDataCalculateDataError('footTraffic', `Error fetching count data: ${err}`));
    }

    if (data.length > 0) {
      dispatch(exploreDataCalculateDataComplete('footTraffic', data));
    } else {
      dispatch(exploreDataCalculateDataComplete('footTraffic', null));
    }
  }
}

export const DAILY_RAW_EVENTS_PAGE_SIZE = 10;

export function calculateDailyRawEvents(space) {
  return async (dispatch, getState) => {
    // Mark the foot traffic card as in a loading state
    dispatch(exploreDataCalculateDataLoading('dailyRawEvents', null));

    const {
      date,
      dailyRawEventsPage,
      timeSegmentGroupId,
    } = getState().spaces.filters;

    // Add timezone offset to both start and end times prior to querying for the count.
    const day = parseISOTimeAtSpace(date, space);

    let preResponse;
    try {
      preResponse = await core().get(`/spaces/${space.id}/events`, {params: {
        start_time: formatInISOTimeAtSpace(day.clone().startOf('day'), space),
        end_time: formatInISOTimeAtSpace(day.clone().startOf('day').add(1, 'day'), space),
        time_segment_groups: timeSegmentGroupId === DEFAULT_TIME_SEGMENT_GROUP.id ? undefined : timeSegmentGroupId,
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
      .map(i => objectSnakeToCamel(i))
      .sort((a, b) => moment.utc(b.timestamp).valueOf() - moment.utc(a.timestamp).valueOf());

    // Calculate a unique array of all doorways that are referenced by each event that was
    // returned.
    const uniqueArrayOfDoorways = data.reduce((acc, item) => {
      if (acc.indexOf(item.doorwayId) === -1) {
        return [...acc, item.doorwayId];
      } else {
        return acc;
      }
    }, []);

    // Fetch information about each doorway in each event, if the doorway information isn't
    // already known.
    const doorwayRequests = uniqueArrayOfDoorways.map(async doorwayId => {
      try {
        return (await core().get(`/doorways/${doorwayId}`)).data;
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
}
