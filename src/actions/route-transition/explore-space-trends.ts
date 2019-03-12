import moment from 'moment';
import core from '../../client/core';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionTimeSegmentGroupsError from '../collection/time-segment-groups/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';
import collectionSpacesFilter from '../collection/spaces/filter';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../helpers/fetch-all-pages/index';
import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report/index';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../actions/explore-data/calculate-data-error';

import { getActiveEnvironments } from '../../components/environment-switcher/index';
import { getGoSlow } from '../../components/environment-switcher/index';
import fields from '../../fields';

import { REPORTS } from '@density/reports';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
  requestCountsForLocalRange
} from '../../helpers/space-time-utilities/index';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  findTimeSegmentsInTimeSegmentGroupForSpace,
} from '../../helpers/time-segments/index';


export const ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS = 'ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS';

export default function routeTransitionExploreSpaceTrends(id) {
  return async (dispatch, getState) => {
    // Prior to changing the active page, change the module state to be loading.
    dispatch(exploreDataCalculateDataLoading('dailyMetrics', null));
    dispatch(exploreDataCalculateDataLoading('utilization', null));
    dispatch(exploreDataCalculateDataLoading('hourlyBreakdownVisits', null));
    dispatch(exploreDataCalculateDataLoading('hourlyBreakdowPeaks', null));

    // Change the active page
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS, id });

    // Load a list of all time segment groups, which is required in order to render in the time
    // segment list.

    let errorThrown: any = false
    let response;
    try {
      response = await core().get('/time_segment_groups');
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(collectionTimeSegmentGroupsError(`Error loading time segments: ${errorThrown.message}`));
    } else {
      dispatch(collectionTimeSegmentGroupsSet(response.data.results));
    }

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

    let startDate, endDate;
    let state = getState()
    if (state.spaces.filters.startDate != null && state.spaces.filters.endDate != null) {
      startDate = state.spaces.filters.startDate
      endDate = state.spaces.filters.endDate
    } else {
      startDate = formatInISOTimeAtSpace(getCurrentLocalTimeAtSpace(selectedSpace).subtract(1, 'week').startOf('week'), selectedSpace);
      endDate = formatInISOTimeAtSpace(getCurrentLocalTimeAtSpace(selectedSpace).subtract(1, 'week').endOf('week'), selectedSpace);
    }

    dispatch(collectionSpacesFilter(
      'startDate',
      startDate
    ));
    dispatch(collectionSpacesFilter(
      'endDate',
      endDate
    ));

    dispatch(calculate(selectedSpace));
  }
}

export function calculate(space) {
  return dispatch => {
    dispatch(calculateDailyMetrics(space));
    dispatch(calculateUtilization(space));
    dispatch(calculateHourlyBreakdown(space, 'hourlyBreakdownPeaks', 'PEAKS', 'Hourly Breakdown - Average Peak Occupancy', "AVERAGE"));
    dispatch(calculateHourlyBreakdown(space, 'hourlyBreakdownVisits', 'VISITS', 'Hourly Breakdown - Visits', "NONE"));
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
    dispatch(exploreDataCalculateDataLoading('dailyMetrics', null));

    const {
      timeSegmentGroupId,
      metricToDisplay,
      startDate,
      endDate,
    } = getState().spaces.filters;

    const allTimeSegmentGroups = getState().timeSegmentGroups.data;

    const spaceTimeSegmentGroups = [
      DEFAULT_TIME_SEGMENT_GROUP,
      ...allTimeSegmentGroups.filter(x => space.timeSegmentGroups.find(y => x.id === y.id))
    ];

    // Which time segment group was selected?
    const selectedTimeSegmentGroup = spaceTimeSegmentGroups.find(i => i.id === timeSegmentGroupId);

    // And, with the knowlege of the selected space, which time segment within that time segment
    // group is applicable to this space?
    const applicableTimeSegments = findTimeSegmentsInTimeSegmentGroupForSpace(
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
          page_size: 5000,
          time_segment_groups: selectedTimeSegmentGroup.id === DEFAULT_TIME_SEGMENT_GROUP.id ? undefined : selectedTimeSegmentGroup.id
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
          return applicableTimeSegments.reduce((acc, ts) => {
            return [...acc, ...ts.days.map(i => DAY_TO_INDEX[i])];
          }, []).indexOf(dayOfWeek) !== -1;
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


export function calculateUtilization(space) {
  return async (dispatch, getState) => {
    dispatch(exploreDataCalculateDataLoading('utilization', null));

    const { startDate, endDate, timeSegmentGroupId } = getState().spaces.filters;
    const allTimeSegmentGroups = getState().timeSegmentGroups.data;

    const spaceTimeSegmentGroups = [
      DEFAULT_TIME_SEGMENT_GROUP,
      ...allTimeSegmentGroups.filter(x => space.timeSegmentGroups.find(y => x.id === y.id))
    ];

    // Which time segment group was selected?
    const selectedTimeSegmentGroup = spaceTimeSegmentGroups.find(i => i.id === timeSegmentGroupId);

    if (!space.capacity) {
      dispatch(exploreDataCalculateDataComplete('utilization', { requiresCapacity: true }));
      return;
    }

    // Step 1: Fetch all counts--which means all pages--of data from the start date to the end data
    // selected on the DateRangePicker. Uses the `fetchAllPages` helper, which encapsulates the
    // logic required to fetch all pages of data from the server.
    const counts = await fetchAllPages(page => (
      core().get(`/spaces/${space.id}/counts`, { params: {
        id: space.id,

        start_time: startDate,
        end_time: endDate,
        time_segment_groups: selectedTimeSegmentGroup.id === DEFAULT_TIME_SEGMENT_GROUP.id ? undefined : selectedTimeSegmentGroup.id,

        interval: '10m',

        // Fetch with a large page size to try to minimize the number of requests that will be
        // required.
        page,
        page_size: 5000,
      }})
    ));

    // Variables for rendering the trends page
    let utilizationsByDay: any[] = [],
        utilizationsByTime: any[] = [],
        averageUtilizationPercentage = 0,
        peakUtilizationPercentage = 0,
        peakUtilizationTimestamp: any = null;

    // Group utilization data for two different charts
    counts.forEach(item => {

      // Sum all values so we can get the overall average
      averageUtilizationPercentage += item.interval.analytics.utilization || 0;

      // Group by day of week
      const dayOfWeek = parseISOTimeAtSpace(item.timestamp, space).format('dddd');
      const dayUtilization = utilizationsByDay.find(x => x.day === dayOfWeek);
      if (!dayUtilization) {
        utilizationsByDay.push({
          day: dayOfWeek,
          data: [item.interval.analytics.utilization || 0]
        });
      } else {
        dayUtilization.data.push(item.interval.analytics.utilization || 0);
      }

      // Group by time of day
      const timeOfDay = parseISOTimeAtSpace(item.timestamp, space).format('HH:mm');
      const timeUtilization = utilizationsByTime.find(x => x.time === timeOfDay);
      if (!timeUtilization) {
        utilizationsByTime.push({
          time: timeOfDay,
          data: [item.interval.analytics.utilization || 0]
        });
      } else {
        timeUtilization.data.push(item.interval.analytics.utilization || 0);
      }
    });

    // Average data for grouped days
    utilizationsByDay.forEach(item => {
      item.average = item.data.reduce((a, n) => a + n, 0) / item.data.length;
    });

    // Average data for grouped times (and save peak timestamp)
    utilizationsByTime.forEach(item => {
      item.average = item.data.reduce((a, n) => a + n, 0) / item.data.length;
      if (item.average > peakUtilizationPercentage) {
        peakUtilizationPercentage = item.average;
        peakUtilizationTimestamp = moment.tz(item.time, 'HH:mm', space.timeZone).valueOf();
      }
    });

    // Process overall average by dividing by length
    averageUtilizationPercentage /= counts.length;

    // Sort grouped-by-time data
    utilizationsByTime.sort(
      (a, b) => moment(a.time, 'HH:mm').valueOf() - moment(b.time, 'HH:mm').valueOf()
    );

    dispatch(exploreDataCalculateDataComplete('utilization', {
      requiresCapacity: false,
      utilizationsByDay,
      utilizationsByTime,
      averageUtilizationPercentage,
      peakUtilizationPercentage,
      peakUtilizationTimestamp,
      counts
    }));
  };
}

export function calculateHourlyBreakdown(space, reportName, metric, title, aggregation) {
  return async (dispatch, getState) => {
    dispatch(exploreDataCalculateDataLoading(reportName, null));
    const { startDate, endDate } = getState().spaces.filters;
    const report = generateHourlyBreakdownEphemeralReport(space, startDate, endDate, metric, title, aggregation);

    const baseUrl = (getActiveEnvironments(fields) as any).core;
    const token = getState().sessionToken;
    const slow = getGoSlow();

    let data, errorThrown: any = false;
    try {
      data = await REPORTS['HOURLY_BREAKDOWN'].calculations(report, {
        date: null,
        baseUrl,
        token,
        slow,
      });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      // Log the error so a developer can see what whent wrong.
      console.error(errorThrown); // DON'T REMOVE ME!
      dispatch(exploreDataCalculateDataError(reportName, errorThrown));
    } else {
      dispatch(exploreDataCalculateDataComplete(reportName, data));
    }   
  }
}

