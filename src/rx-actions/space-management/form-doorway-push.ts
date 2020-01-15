export const SPACE_MANAGEMENT_FORM_DOORWAY_PUSH = 'SPACE_MANAGEMENT_FORM_DOORWAY_PUSH';

export default function spaceManagementFormDoorwayPush(doorway, sensor_placement) {
  return { type: SPACE_MANAGEMENT_FORM_DOORWAY_PUSH, doorway, sensor_placement };
}
