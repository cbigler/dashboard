import ActionTypes from './action-types';

export default function spacesSetReportControllers(space, controllers) {
  return {
    type: ActionTypes.SPACES_SET_REPORT_CONTROLLERS,
    space,
    controllers,
  };
}
