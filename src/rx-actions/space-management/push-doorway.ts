import { CoreDoorway, CoreDoorwaySpace } from "@density/lib-api-types/core-v2/doorways";

export const SPACE_MANAGEMENT_PUSH_DOORWAY = 'SPACE_MANAGEMENT_PUSH_DOORWAY' as const;


export default function pushDoorway(item: CoreDoorway, initialSensorPlacement: CoreDoorwaySpace['sensor_placement'] | null = null) {
  return {
    type: SPACE_MANAGEMENT_PUSH_DOORWAY,
    item,
    initialSensorPlacement,
  };
}
