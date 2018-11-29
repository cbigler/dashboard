import { core } from '../../client';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';
import collectionSpacesFilter from '../collection/spaces/filter';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';

import exploreDataAddCalculation from '../../actions/explore-data/add-calculation';
import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../actions/explore-data/calculate-data-error';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
  getDurationBetweenMomentsInDays,
  requestCountsForLocalRange
} from '../../helpers/space-time-utilities/index';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  DEFAULT_TIME_SEGMENT,
  findTimeSegmentInTimeSegmentGroupForSpace,
  parseTimeInTimeSegmentToSeconds,
} from '../../helpers/time-segments/index';

export const ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS = 'ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS';

export default function routeTransitionExploreSpaceTrends(id) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS, id });

    // Load a list of all time segment groups, which is required in order to render in the time
    // segment list.
    try {
      const timeSegmentGroups = await core.time_segment_groups.list();
      dispatch(collectionTimeSegmentGroupsSet(timeSegmentGroups.results));
    } catch (err) {
      dispatch(collectionTimeSegmentGroupsError(`Error loading time segments: ${err.message}`));
    }

    // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
    // every space to traverse through the space hierarchy and render a list of parent spaces on
    // this view unrfortunately.
    let spaces, selectedSpace;
    try {
      spaces = (await fetchAllPages(
        page => core.spaces.list({page, page_size: 1000})
      )).map(objectSnakeToCamel);
      selectedSpace = spaces.find(s => s.id === id);
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
      return;
    }

    dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));
    dispatch(collectionSpacesSet(spaces));

    dispatch(collectionSpacesFilter(
      'startDate',
      formatInISOTimeAtSpace(getCurrentLocalTimeAtSpace(selectedSpace).subtract(1, 'week').startOf('week'), selectedSpace),
    ));
    dispatch(collectionSpacesFilter(
      'endDate',
      formatInISOTimeAtSpace(getCurrentLocalTimeAtSpace(selectedSpace).subtract(1, 'week').endOf('week'), selectedSpace),
    ));

    dispatch(calculate(selectedSpace));
  }
}

export function calculate(space) {
  return dispatch => {
    dispatch(calculateDailyMetrics(space));
  };
}

const DAY_TO_INDEX = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0,
};

export function calculateDailyMetrics(space) {
  return async (dispatch, getState) => {
    dispatch(exploreDataCalculateDataLoading('dailyMetrics'));

    const {
      metricToDisplay,
      startDate,
      endDate,
      timeSegmentGroupId,
    } = getState().spaces.filters;

    const timeSegmentGroupArray = [DEFAULT_TIME_SEGMENT_GROUP, ...space.timeSegmentGroups];

    // Which time segment group was selected?
    const selectedTimeSegmentGroup = timeSegmentGroupArray.find(i => i.id === getState().spaces.filters.timeSegmentGroupId);

    // And, with the knowlege of the selected space, which time segment within that time segment
    // group is applicable to this space?
    const applicableTimeSegment = findTimeSegmentInTimeSegmentGroupForSpace(
      selectedTimeSegmentGroup,
      space,
    );

    // Add timezone offset to both start and end times prior to querying for the count. Add a day
    // to the end of the range to return a final bar of the data for the uncompleted current day.
    const startTime = parseISOTimeAtSpace(startDate, space).startOf('day');
    const endTime = parseISOTimeAtSpace(endDate, space).startOf('day').add(1, 'day');

    // Fetch data from the server for the day-long window.
    let data;
    try {
      data = await requestCountsForLocalRange(
        space,
        startTime,
        endTime,
        {
          interval: '1d',
          order: 'asc',
          page_size: 1000,
          time_segment_groups: selectedTimeSegmentGroup.id === DEFAULT_TIME_SEGMENT_GROUP.id ? '' : selectedTimeSegmentGroup.id
        },
      );
    } catch (error) {
      console.error(error);
      dispatch(exploreDataCalculateDataError('dailyMetrics', error));
      return;
    }

    if (data.length > 0) {
      dispatch(exploreDataCalculateDataComplete('dailyMetrics', {
        dataSpaceId: space.id,
        // Return the metric requested within the range of time.
        metrics: data.filter(i => {
          // Remove days from the dataset that are not in the time segment
          const dayOfWeek = parseISOTimeAtSpace(i.timestamp, space).day();
          return applicableTimeSegment.days
            .map(i => DAY_TO_INDEX[i])
            .indexOf(dayOfWeek) !== -1;
        }).map(i => ({
          timestamp: i.timestamp,
          value: (function(i, metric) {
            switch (metric) {
            case 'entrances':
              return i.interval.analytics.entrances;
            case 'exits':
              return i.interval.analytics.exits;
            case 'total-events':
              return i.interval.analytics.events;
            case 'peak-occupancy':
              return i.interval.analytics.max;
            default:
              return false
            }
          })(i, metricToDisplay) || 0,
        })),
      }));
    } else {
      dispatch(exploreDataCalculateDataComplete('dailyMetrics', {
        dataSpaceId: space.id,
        metrics: null,
      }));
    }
  };
}
