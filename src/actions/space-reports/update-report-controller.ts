import ActionTypes from './action-types';

export default function spacesUpdateReportController(space, controller) {
  return {
    type: ActionTypes.SPACES_SET_REPORT_CONTROLLERS,
    space,
    controller,
  };
}
