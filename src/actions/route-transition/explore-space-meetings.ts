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
} from '../../types';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import {
  exploreDataRobinSpacesSet,
  exploreDataRobinSpacesError,
  exploreDataRobinSpacesSelect,
} from '../../actions/explore-data/robin';
import { calculateDashboardDate } from './dashboard-detail';

import { getGoSlow } from '../../components/environment-switcher';

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



export const ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS = 'ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS';

export default function routeTransitionExploreSpaceMeeting(id) {
  return async (dispatch, getState) => {
    // Prior to changing the active page, change the module state to be loading.
    dispatch(exploreDataCalculateDataLoading('meetings', null));

    // Change the active page
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS, id });

    // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
    // every space to traverse through the space hierarchy and render a list of parent spaces on
    // this view unrfortunately.
    let spaces, selectedSpace;
    try {
      spaces = (await fetchAllPages(
        async page => (await core().get('/spaces', {params: {page, page_size: 5000}})).data
      )).map(s => objectSnakeToCamel<DensitySpace>(s));
      selectedSpace = spaces.find(s => s.id === id);
    } catch (err) {
      dispatch(collectionSpacesError(`Error loading space: ${err.message}`));
      return;
    }

    dispatch(collectionSpacesSet(spaces));
    dispatch(collectionSpacesSetDefaultTimeRange(selectedSpace));


    let robinSpaces;
    try {
      robinSpaces = objectSnakeToCamel(await core().get('/integrations/robin/spaces', {})).data
    } catch (err) {
      dispatch(exploreDataRobinSpacesError(`Error loading robin spaces: ${err.message}`));
      return;
    }
    dispatch(exploreDataRobinSpacesSet(robinSpaces));

    // Attempt to find a space mapping for this space
    const spaceMappingExists = await (async function() {
      let spaceMappingResponse;
      try {
        spaceMappingResponse = await core().get(`/integrations/space_mappings/space/${id}`, {});
      } catch (err) {
        if (err.indexOf('404') >= 0) {
          // Space mapping was not found
          dispatch(exploreDataRobinSpacesSelect(null));
          return false;
        } else {
          dispatch(exploreDataRobinSpacesError(`Error loading space mapping: ${err.message}`));
          return false;
        }
      }

      // Space mapping exists
      const spaceMapping = objectSnakeToCamel<DensitySpaceMapping>(spaceMappingResponse.data);
      dispatch(exploreDataRobinSpacesSelect(spaceMapping));
      return true;
    })();

    if (spaceMappingExists) {
      dispatch(calculate(id));
    }
  }
}

const MEETING_EPHEMERAL_REPORT_GENERATORS: (string) => Array<DensityReport> = (spaceId) => [
  {
    id: 'rpt_ephemeral_meeting_attendance',
    name: 'Meeting Attendance',
    type: 'MEETING_ATTENDANCE',
    settings: {
      foo: 'bar',
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_meeting_size',
    name: 'Meeting SIZE',
    type: 'MEETING_SIZE',
    settings: {
      foo: 'bar',
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_top_room_booker',
    name: 'Top Room Booker',
    type: 'MEETING_SIZE',
    settings: {
      timeRange: 'LAST_WEEK',
      spaceId,
    },
    creatorEmail: 'engineering@density.io',
  },
  {
    id: 'rpt_ephemeral_busiest_meeting',
    name: 'Busiest Meeting',
    type: 'BUSIEST_MEETING',
    settings: {
      foo: 'bar',
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

    const meetingEphemeralReportGenerators = MEETING_EPHEMERAL_REPORT_GENERATORS(id);
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
          return { state: 'COMPLETE', data };
        } catch (error) {
          console.log(error);
          return { state: 'ERROR', error };
        }
      })
    );

    dispatch(exploreDataCalculateDataComplete('meetings', meetingReportResults))
  };
}
