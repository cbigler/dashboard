import moment from 'moment';
import {
  ISpaceReportController,
  SpaceReportControlTypes,
  SpaceReportActionTypes,
} from '../../interfaces/space-reports';
import { DensitySpace } from '../../types';
import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import { serializeMomentToDateString } from '../../helpers/space-time-utilities';

const now = moment();
const startDate = serializeMomentToDateString(moment(now).subtract(2, 'weeks'));
const endDate = serializeMomentToDateString(moment(now).subtract(1, 'day'));

export const initialState = {
  space: null,
  controllers: [{
    key: 'trends_page_controls',
    status: 'LOADING',
    reports: [{
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
        id: 'rpt_ephemeral_daily_occupancy',
        name: 'Daily Occupancy',
        type: 'PERIODIC_METRICS',
        settings: {
          spaceId: null as string | null,
          metric: 'PEAK_OCCUPANCY'
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
          //scrollable: true,
          metric: 'VISITS',
          aggregation: 'NONE',
          includeWeekends: true,
          hourStart: 6,
          hourEnd: 20
        }
      }
    }, {
      data: null,
      configuration: {
        id: 'rpt_ephemeral_hourly_count',
        name: 'Count per Hour',
        type: 'HOURLY_BREAKDOWN',
        settings: {
          spaceId: null as string | null,
          scrollable: true,
          metric: 'PEAKS',
          aggregation: 'NONE',
          includeWeekends: true,
          hourStart: 6,
          hourEnd: 20
        }
      }
    }, {
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
      key: 'Time Segment',
      controlType: SpaceReportControlTypes.TIME_SEGMENT,
      timeSegment: DEFAULT_TIME_SEGMENT_LABEL
    }, {
      key: 'Date Range',
      controlType: SpaceReportControlTypes.DATE_RANGE,
      startDate,
      endDate,
    }]
  }] as Array<ISpaceReportController>
};

export default function spaceReports(state=initialState, action: {
  type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
  controllers: Array<ISpaceReportController>,
  space: DensitySpace
} | {
  type: SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
  controller: ISpaceReportController
}) {
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
