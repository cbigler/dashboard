import { CoreSpace, CoreSpaceHierarchyNode } from "@density/lib-api-types/core-v2/spaces";
import { CoreDoorway } from "@density/lib-api-types/core-v2/doorways";

export const SPACE_MANAGEMENT_SET_DATA = 'SPACE_MANAGEMENT_SET_DATA' as const;

export default function spaceManagementSetData(hierarchy: CoreSpaceHierarchyNode[], spaces: CoreSpace[], doorways: CoreDoorway[], labels: string[]) {
  return {
    type: SPACE_MANAGEMENT_SET_DATA,
    hierarchy,
    spaces,
    doorways,
    labels,
  };
}
