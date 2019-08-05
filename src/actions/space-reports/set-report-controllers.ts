import { SpaceReportActionTypes } from '../../interfaces/space-reports';

export default function spacesSetReportControllers(space, controllers) {
  return {
    type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
    space,
    controllers,
  };
}
