export const SPACE_SET_REPORT_CONTROLLER_VALUES = 'EXPLORE_DATA_ADD_CALCULATION';

export default function setReportControllerValues(controller, key, value) {
  return {
    type: SPACE_SET_REPORT_CONTROLLER_VALUES,
    controller,
    key,
    value
  };
}
