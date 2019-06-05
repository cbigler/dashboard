import moment from 'moment';
import { REPORTS } from '@density/reports';
import core from '../../client/core';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import collectionSpacesSetDefaultTimeRange from '../collection/spaces/set-default-time-range';
import collectionSpacesFilter from '../collection/spaces/filter';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import fetchAllPages from '../../helpers/fetch-all-pages';

import {
  DensityReport,
  DensityReportCalculatationFunction,
  DensitySpaceMapping,
  DensitySpace,
  DensityService,
} from '../../types';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import {
  integrationsRoomBookingSetService,
} from '../../actions/integrations/room-booking';
import { calculateDashboardDate } from './dashboard-detail';

import { getGoSlow } from '../../components/environment-switcher';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  formatInISOTimeAtSpace,
  requestCountsForLocalRange
} from '../../helpers/space-time-utilities/index';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionServicesError from '../collection/services/error';

export const ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS = 'ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS';

export default function routeTransitionExploreSpaceMeeting(id, serviceName) {
  return async (dispatch, getState) => {
    // Prior to changing the active page, change the module state to be loading.
    dispatch(exploreDataCalculateDataLoading('meetings', null));

    // Change the active page
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS, id });

    // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
    // every space to traverse through the space hierarchy and render a list of parent spaces on
    // this view unrfortunately.
    let spaces, spaceHierarchy, selectedSpace;
    try {
      spaceHierarchy = (await core().get('/spaces/hierarchy')).data;
      spaces = (await fetchAllPages(
        async page => (await core().get('/spaces', {params: {page, page_size: 5000}})).data
      )).map(s => objectSnakeToCamel<DensitySpace>(s));
      selectedSpace = spaces.find(s => s.id === id);
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
      return;
    }

    dispatch(collectionSpacesSet(spaces));
    dispatch(collectionSpaceHierarchySet(spaceHierarchy));
    dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));

    // Determine if a room booking integration is active
    const services: Array<DensityService> = await (async function() {
      let servicesResponse;
      try {
        servicesResponse = await core().get('/integrations/services/', {});
      } catch (err) {
        dispatch(collectionServicesError(`Error loading integrations list: ${err.message}`));
        return null;
      }

      return servicesResponse.data.map(s => objectSnakeToCamel<DensityService>(s));
    })();

    let roomBookingService;
    if (serviceName) {
      roomBookingService = services.find(service => service.name === serviceName);
    } else {
      roomBookingService = services
        .filter(service => service.category === 'Room Booking')
        .filter(service => typeof service.serviceAuthorization.id !== 'undefined')
        .find(service => service.serviceAuthorization.default);
    }

    dispatch(integrationsRoomBookingSetService(roomBookingService));

    const spaceMappingExists = selectedSpace.spaceMappings.length > 0;

    if (spaceMappingExists) {
      dispatch(calculate(id));
    }
  }
}

const MEETING_EPHEMERAL_REPORT_GENERATORS = (spaceId, startDate, endDate) => [
  {
    id: 'rpt_ephemeral_meeting_attendance',
    name: 'Meeting attendance',
    type: 'MEETING_ATTENDANCE',
    settings: {
      spaceId,
      timeRange: { type: 'CUSTOM_RANGE', startDate, endDate },
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_meeting_size',
    name: 'Meeting size',
    type: 'MEETING_SIZE',
    settings: {
      spaceId,
      timeRange: { type: 'CUSTOM_RANGE', startDate, endDate },
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_booking_behavior',
    name: 'Booker behavior',
    type: 'BOOKING_BEHAVIOR',
    settings: {
      spaceId,
      timeRange: { type: 'CUSTOM_RANGE', startDate, endDate },
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_busiest_meeting',
    name: 'Meetings: Day-to-day',
    type: 'DAY_TO_DAY_MEETINGS',
    settings: {
      spaceId,
      timeRange: { type: 'CUSTOM_RANGE', startDate, endDate },
    },
    creatorEmail: 'engineering@density.io',
  },
];

export function calculate(id) {
  return async (dispatch, getState) => {
    dispatch(exploreDataCalculateDataLoading('meetings'));

    // Use the same mechanism for calculating the `date` parameter that dashboards use.
    const weekStart = getState().user.data.organization.settings.dashboardWeekStart;
    dispatch(calculateDashboardDate(weekStart));
    const date = getState().miscellaneous.dashboardDate;

    const { startDate, endDate } = getState().spaces.filters;

    const meetingEphemeralReportGenerators: Array<DensityReport> = MEETING_EPHEMERAL_REPORT_GENERATORS(
      id,
      startDate,
      endDate,
    );
    const meetingReportResults = await Promise.all(
      meetingEphemeralReportGenerators.map(async report => {
        const reportDataCalculationFunction: DensityReportCalculatationFunction = REPORTS[report.type].calculations;

        let errorThrown;
        try {
          const data = await reportDataCalculationFunction(report, {
            date,
            weekStart,
            client: core(),
            slow: getGoSlow(),
          });
          return { report, state: 'COMPLETE', data };
        } catch (error) {
          console.log(error);
          return { report, state: 'ERROR', error };
        }
      })
    );

    dispatch(exploreDataCalculateDataComplete('meetings', meetingReportResults))
  };
}
