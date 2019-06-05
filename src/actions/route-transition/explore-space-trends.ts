import moment from 'moment';
import core from '../../client/core';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';
import collectionSpacesFilter from '../collection/spaces/filter';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import fetchAllPages from '../../helpers/fetch-all-pages';
import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report';
import isMultiWeekSelection from '../../helpers/multi-week-selection';

import { DensitySpace } from '../../types';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../actions/explore-data/calculate-data-error';

import { getGoSlow } from '../../components/environment-switcher';

import { REPORTS } from '@density/reports';

import {
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
  requestCountsForLocalRange
} from '../../helpers/space-time-utilities/index';

import {
  DEFAULT_TIME_SEGMENT_LABEL,
} from '../../helpers/time-segments/index';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';


export const ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS = 'ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS';

export default function routeTransitionExploreSpaceTrends(id) {
  return async (dispatch, getState) => {
    // Prior to changing the active page, change the module state to be loading.
    dispatch(exploreDataCalculateDataLoading('dailyMetrics', null));
    dispatch(exploreDataCalculateDataLoading('utilization', null));
    dispatch(exploreDataCalculateDataLoading('hourlyBreakdownVisits', null));
    dispatch(exploreDataCalculateDataLoading('hourlyBreakdownPeaks', null));

    // Change the active page
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS, id });

    // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
    // every space to traverse through the space hierarchy and render a list of parent spaces on
    // this view unrfortunately.
    let spaces, spaceHierarchy, selectedSpace;
    try {
      spaceHierarchy = (await core().get('/spaces/hierarchy')).data;
      spaces = (await fetchAllPages(
        async page => (await core().get('/spaces', {params: {page, page_size: 5000}})).data
      )).map(s => objectSnakeToCamel<DensitySpace>(s));
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
      return;
    }

    selectedSpace = spaces.find(s => s.id === id);
    if (!selectedSpace) {
      dispatch(collectionSpacesError(`Space with id ${id} not found`));
      return;
    }

    dispatch(collectionSpacesSet(spaces));
    dispatch(collectionSpaceHierarchySet(spaceHierarchy));
    dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));

    let state = getState();
    dispatch(collectionSpacesFilter('startDate', state.spaces.filters.startDate));
    dispatch(collectionSpacesFilter('endDate', state.spaces.filters.endDate));

    dispatch(calculate(selectedSpace, state.spaces.filters));
  }
}

export function calculate(space, spaceFilters) {
  return (dispatch, getState) => {
    const multiWeekSelection = isMultiWeekSelection(spaceFilters.startDate, spaceFilters.endDate);

    const peakTitle = multiWeekSelection ? "Hourly Breakdown: Average Peak Occupancy" : "Hourly Breakdown: Peak Occupancy"

    // Don't perform calculations if user hasn't selected an end date yet in the date picker.
    const { startDate, endDate } = getState().spaces.filters;
    if (
      parseISOTimeAtSpace(startDate, space)
      .isAfter(parseISOTimeAtSpace(endDate, space))
    ) {
      const error = "End time must be before start time.";
      const reportNames = ['dailyMetrics', 'hourlyBreakdownPeaks', 'hourlyBreakdownVisits', 'utilization'];
      reportNames.map(reportName => {
        dispatch(exploreDataCalculateDataError(reportName, error));  
      });
      return;
    }

    dispatch(calculateDailyMetrics(space));
    dispatch(calculateUtilization(space));
    dispatch(calculateHourlyBreakdown(space, 'hourlyBreakdownPeaks', 'PEAKS', peakTitle, "AVERAGE"));
    dispatch(calculateHourlyBreakdown(space, 'hourlyBreakdownVisits', 'VISITS', 'Hourly Breakdown: Visits', "NONE"));
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
      timeSegmentLabel,
      metricToDisplay,
      startDate,
      endDate,
    } = getState().spaces.filters;

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
          time_segment_labels: timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL ? undefined : timeSegmentLabel,
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
        metrics: data.map(i => ({
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

    const { startDate, endDate, timeSegmentLabel } = getState().spaces.filters;

    if (!space.capacity) {
      dispatch(exploreDataCalculateDataComplete('utilization', { requiresCapacity: true }));
      return;
    }

    // Step 1: Fetch all counts--which means all pages--of data from the start date to the end data
    // selected on the DateRangePicker. Uses the `fetchAllPages` helper, which encapsulates the
    // logic required to fetch all pages of data from the server.
    let errorThrown, counts;
    try {
      counts = (await fetchAllPages(async page => (
        (await core().get(`/spaces/${space.id}/counts`, { params: {
          id: space.id,

          start_time: startDate,
          end_time: endDate,
          time_segment_labels: timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL ? undefined : timeSegmentLabel,

          interval: '10m',

          // Fetch with a large page size to try to minimize the number of requests that will be
          // required.
          page,
          page_size: 5000,

          // Legacy "slow" queries
          slow: getGoSlow(),
        }})).data
      ))).map(objectSnakeToCamel);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(exploreDataCalculateDataError('utilization', errorThrown.message));
      return;
    }

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
    const report = generateHourlyBreakdownEphemeralReport(
      space,
      formatInISOTimeAtSpace(moment.utc(startDate), space),
      formatInISOTimeAtSpace(moment.utc(endDate), space),
      metric,
      title,
      aggregation,
    );

    let data, errorThrown: any = false;
    try {
      data = await REPORTS['HOURLY_BREAKDOWN'].calculations(report, {
        date: null,
        client: core(),
        slow: getGoSlow(),
      });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      // Log the error so a developer can see what whent wrong.
      console.error(errorThrown.message); // DON'T REMOVE ME!
      dispatch(exploreDataCalculateDataError(reportName, errorThrown.message));
    } else {
      dispatch(exploreDataCalculateDataComplete(reportName, data));
    }
  }
}

