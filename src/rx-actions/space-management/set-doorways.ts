export const SPACE_MANAGEMENT_SET_DOORWAYS = 'SPACE_MANAGEMENT_SET_DOORWAYS';

export default function spaceManagementSetDoorways(doorways) {
  return { type: SPACE_MANAGEMENT_SET_DOORWAYS, doorways };
}
