export const SPACE_MANAGEMENT_PUSH_DOORWAY = 'SPACE_MANAGEMENT_PUSH_DOORWAY';

export default function pushDoorway(item, initialSensorPlacement=null) {
  return { type: SPACE_MANAGEMENT_PUSH_DOORWAY, item, initialSensorPlacement };
}
