import ActionTypes from '../../actions/space-reports/action-types';
import { ReactComponentLike } from 'prop-types';
import moment from 'moment';

export enum ReportControlTypes {
  DATE = 'date',
  DATE_RANGE = 'date_range',
  TIME_SEGMENT = 'time_segment'
}

export type ReportControl = {
  key: string,
  label?: string,
} & ({
  controlType: ReportControlTypes.DATE,
  date: string,
} | {
  controlType: ReportControlTypes.DATE_RANGE,
  startDate: string,
  endDate: string,
} | {
  controlType: ReportControlTypes.TIME_SEGMENT,
  timeSegment: string,
});

export type ReportData = {
  status: 'LOADING';
  data: any;
  report: {
    component: ReactComponentLike;
    calculations: Function;
  };
};

export type ReportController = {
  key: string;
  reports: Array<ReportData>;
  controls: Array<ReportControl>;
};


const initialState = {
  space: null,
  controllers: [{
    key: 'Report Controls',
    reports: [],
    controls: [{
      key: 'Date',
      controlType: ReportControlTypes.DATE_RANGE,
      startDate: moment().subtract(2, 'weeks').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    }]
  }] as Array<ReportController>
};


export default function spaceReports(state=initialState, action: {
  type: ActionTypes.SPACES_SET_REPORT_CONTROLLERS,
  controllers: Array<ReportController>
} | {
  type: ActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
  controller: ReportController
}) {
  switch (action.type) {

  // // Change the space that is currently selected
  // case SPACES_SET_REPORT_SPACE:
  //   return {
  //     ...state,
  //     action.space
  //   };

  // Change the report controllers that are currently active
  case ActionTypes.SPACES_SET_REPORT_CONTROLLERS:
    return {
      ...state,
      controllers: action.controllers
    };

  // Update one of the report controllers
  case ActionTypes.SPACES_UPDATE_REPORT_CONTROLLER:
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
