import { CoreDoorway } from "@density/lib-api-types/core-v2/doorways";

export const SPACE_MANAGEMENT_SET_DOORWAYS = 'SPACE_MANAGEMENT_SET_DOORWAYS' as const;

export default function spaceManagementSetDoorways(doorways: CoreDoorway[]) {
  return {
    type: SPACE_MANAGEMENT_SET_DOORWAYS,
    doorways,
  };
}
