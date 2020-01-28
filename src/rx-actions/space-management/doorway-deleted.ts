import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';


export const SPACE_MANAGEMENT_DOORWAY_DELETED = 'SPACE_MANAGEMENT_DOORWAY_DELETED' as const

export default function spaceManagementDoorwayDeleted(doorway_id: CoreDoorway['id']) {
  return {
    type: SPACE_MANAGEMENT_DOORWAY_DELETED,
    doorway_id,
  }
}