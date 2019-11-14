import moment from 'moment';
import {
  ISpaceReportController,
  SpaceReportControlTypes,
  SpaceReportActionTypes,
} from '../../types/space-reports';
import { DensitySpace } from '../../types';
import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import { serializeMomentToDateString } from '../../helpers/space-time-utilities';
import { GlobalAction } from '../../types/rx-actions';
import createRxStore from '..';

const now = moment();
const startDate = serializeMomentToDateString(moment(now).subtract(2, 'weeks'));
const endDate = serializeMomentToDateString(moment(now).subtract(1, 'day'));

const SMALL_ROOM_FUNCTIONS = ['collaboration', 'conference_room', 'focus_quiet', 'meeting_room', 'phone_booth'];


export type SpaceReportsState = {
  space: DensitySpace | null,
  controllers: Any<FixInRefactor>[]
}

export const initialState: SpaceReportsState = {
  space: null,
  controllers: [{
    key: 'trends_page_controller',
    status: 'LOADING',
    reports: [{
      configuration: {
        id: 'rpt_ephemeral_text_1',
        type: 'TEXT',
        settings: { header: 'How many people visit this {FUNCTION}?' }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_daily_visits',
        name: 'Daily Visits',
        type: 'PERIODIC_METRICS',
        settings: {
          spaceId: null as string | null,
          metric: 'ENTRANCES'
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_hourly_visits',
        name: 'Visits per Hour',
        type: 'HOURLY_BREAKDOWN',
        settings: {
          spaceId: null as string | null,
          scrollable: true,
          metric: 'VISITS',
          aggregation: 'NONE',
          includeWeekends: true,
          hourStart: 6,
          hourEnd: 20
        }
      }
    }, {
      configuration: {
        id: 'rpt_ephemeral_text_2',
        type: 'TEXT',
        settings: { header: 'How busy does this {FUNCTION} get?' }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_daily_occupancy',
        name: 'Daily Peak Occupancy',
        type: 'PERIODIC_METRICS',
        settings: {
          spaceId: null as string | null,
          metric: 'PEAK_OCCUPANCY'
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_hourly_occupancy',
        name: 'Average Peak Occupancy per Hour',
        type: 'HOURLY_BREAKDOWN',
        settings: {
          spaceId: null as string | null,
          scrollable: true,
          metric: 'PEAKS',
          aggregation: 'AVERAGE',
          includeWeekends: true,
          hourStart: 6,
          hourEnd: 20
        }
      }
    }, {
      configuration: {
        id: 'rpt_ephemeral_text_3',
        spaceFunctions: SMALL_ROOM_FUNCTIONS,
        type: 'TEXT',
        settings: { header: 'How is this {FUNCTION} used?' }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_time_occupied',
        spaceFunctions: SMALL_ROOM_FUNCTIONS,
        name: 'Time Occupied',
        type: 'TIME_OCCUPIED',
        settings: {
          spaceId: null as string | null,
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_room_use',
        spaceFunctions: SMALL_ROOM_FUNCTIONS,
        name: 'Room Use',
        type: 'OCCUPANCY_DISTRIBUTION',
        settings: {
          spaceId: null as string | null,
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_popular_times',
        spaceFunctions: SMALL_ROOM_FUNCTIONS,
        name: 'Popular Times',
        type: 'POPULAR_TIMES',
        settings: {
          spaceId: null as string | null,
        }
      }
    }],
    controls: [{
      key: 'Time Segment',
      controlType: SpaceReportControlTypes.TIME_SEGMENT,
      timeSegment: DEFAULT_TIME_SEGMENT_LABEL
    }, {
      key: 'Date Range',
      controlType: SpaceReportControlTypes.DATE_RANGE,
      startDate,
      endDate,
    }]
  }, {
    key: 'meetings_page_controller',
    status: 'LOADING',
    reports: [{
      data: null,
      configuration: {
        id: 'rpt_ephemeral_meeting_attendance',
        name: 'Meeting attendance',
        type: 'MEETING_ATTENDANCE',
        settings: {
          spaceId: null as string | null,
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_meeting_size',
        name: 'Meeting size',
        type: 'MEETING_SIZE',
        settings: {
          spaceId: null as string | null,
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_booking_behavior',
        name: 'Booker behavior',
        type: 'BOOKING_BEHAVIOR',
        settings: {
          spaceId: null as string | null,
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_busiest_meeting',
        name: 'Meetings: Day-to-day',
        type: 'DAY_TO_DAY_MEETINGS',
        settings: {
          spaceId: null as string | null,
        }
      }
    }],
    controls: [{
      key: 'Date Range',
      controlType: SpaceReportControlTypes.DATE_RANGE,
      startDate,
      endDate,
    }]
  }] as Array<ISpaceReportController>
};

type SpaceReportsAction = {
  type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
  controllers: Array<ISpaceReportController>,
  space: DensitySpace
} | {
  type: SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
  controller: ISpaceReportController
}

export function spaceReportsReducer(state: SpaceReportsState, action: SpaceReportsAction | GlobalAction) {
  switch (action.type) {

  // Change the report controllers that are currently active
  case SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS:
    return {
      ...state,
      controllers: action.controllers.map(controller => ({
        ...controller,
        reports: controller.reports.map(report => {
          report.configuration.settings.spaceId = action.space.id;
          return {...report};
        })
      }))
    };

  // Update one of the report controllers
  case SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER:
    return {
      ...state,
      controllers: state.controllers.map(x => {
        return x.key === action.controller.key ? action.controller : x;
      })
    };

  default:
    return state;
  }
}

const SpaceReportsStore = createRxStore('SpaceReportsStore', initialState, spaceReportsReducer);
export default SpaceReportsStore;
