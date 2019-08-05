import { SpaceReportActionTypes } from '../../interfaces/space-reports';

export default function spacesUpdateReportController(space, controller) {
  return {
    type: SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
    space,
    controller,
  };
}
