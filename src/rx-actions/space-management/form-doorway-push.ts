import { SpaceManagementState } from "../../rx-stores/space-management";

export const SPACE_MANAGEMENT_FORM_DOORWAY_PUSH = 'SPACE_MANAGEMENT_FORM_DOORWAY_PUSH' as const;


type SpaceManagementFormDoorway = SpaceManagementState['formState']['doorways'][number];
type SensorPlacement = Exclude<SpaceManagementFormDoorway['sensor_placement'], null>

export default function spaceManagementFormDoorwayPush(doorway: SpaceManagementFormDoorway, sensor_placement: SensorPlacement) {
  return {
    type: SPACE_MANAGEMENT_FORM_DOORWAY_PUSH,
    doorway,
    sensor_placement,
  };
}
