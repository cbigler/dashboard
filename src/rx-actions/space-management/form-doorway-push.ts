import { CoreDoorway, CoreDoorwaySpace } from "@density/lib-api-types/core-v2/doorways";

export const SPACE_MANAGEMENT_FORM_DOORWAY_PUSH = 'SPACE_MANAGEMENT_FORM_DOORWAY_PUSH' as const;


export default function spaceManagementFormDoorwayPush(doorway: CoreDoorway, sensor_placement: CoreDoorwaySpace['sensor_placement']) {
  return {
    type: SPACE_MANAGEMENT_FORM_DOORWAY_PUSH,
    doorway,
    sensor_placement,
  };
}
