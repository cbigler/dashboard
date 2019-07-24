import moment from 'moment';
import {
  ISpaceReportController,
  SpaceReportControlTypes,
  SpaceReportActionTypes,
} from '../../interfaces/space-reports';

const initialState = {
  space: null,
  controllers: [{
    key: 'Report Controls',
    reports: [],
    controls: [{
      key: 'Date',
      controlType: SpaceReportControlTypes.DATE_RANGE,
      startDate: moment().subtract(2, 'weeks').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    }]
  }] as Array<ISpaceReportController>
};

export default function spaceReports(state=initialState, action: {
  type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
  controllers: Array<ISpaceReportController>
} | {
  type: SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
  controller: ISpaceReportController
}) {
  switch (action.type) {

  // // Change the space that is currently selected
  // case SPACES_SET_REPORT_SPACE:
  //   return {
  //     ...state,
  //     action.space
  //   };

  // Change the report controllers that are currently active
  case SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS:
    return {
      ...state,
      controllers: action.controllers
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
