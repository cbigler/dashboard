import { SpaceReportActionTypes } from '../../interfaces/space-reports';

export default function spacesUpdateReportController(space, controller) {
  return {
    type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
    space,
    controller,
  };
}
