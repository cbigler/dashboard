import { CoreDoorway } from "@density/lib-api-types/core-v2/doorways";
import { DoorwayItem } from "../../rx-stores/space-management";

export const SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE = 'SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE' as const;

type DoorwayKey = keyof DoorwayItem;
type DoorwayValue<K extends DoorwayKey> = DoorwayItem[K];

export default function spaceManagementFormDoorwayUpdate(id: CoreDoorway['id'], key: DoorwayKey, value: DoorwayValue<typeof key>) {
  return {
    type: SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE,
    id,
    key,
    value,
  };
}
