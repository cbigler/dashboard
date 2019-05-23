export const SPACE_MANAGEMENT_FORM_DOORWAY_SET_SENSOR_PLACEMENT = 'SPACE_MANAGEMENT_FORM_DOORWAY_SET_SENSOR_PLACEMENT';

export default function spaceManagementFormDoorwaySetSensorPlacement(id, sensorPlacement) {
  return { type: SPACE_MANAGEMENT_FORM_DOORWAY_SET_SENSOR_PLACEMENT, id, sensorPlacement };
}
