import { CoreDoorway } from "@density/lib-api-types/core-v2/doorways";
import { SpaceManagementState } from "../../rx-stores/space-management";

export const SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE = 'SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE' as const;

type DoorwayKey = keyof SpaceManagementState['formState']['doorways'][number];
type DoorwayValue<K extends DoorwayKey> = SpaceManagementState['formState']['doorways'][number][K];

export default function spaceManagementFormDoorwayUpdate(id: CoreDoorway['id'], key: DoorwayKey, value: DoorwayValue<typeof key>) {
  return {
    type: SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE,
    id,
    key,
    value,
  };
}
