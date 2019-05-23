export const SPACE_MANAGEMENT_FORM_DOORWAY_PUSH = 'SPACE_MANAGEMENT_FORM_DOORWAY_PUSH';

export default function spaceManagementFormDoorwayPush(doorway, sensorPlacement) {
  return { type: SPACE_MANAGEMENT_FORM_DOORWAY_PUSH, doorway, sensorPlacement };
}
