export const SPACE_MANAGEMENT_SET_DATA = 'SPACE_MANAGEMENT_SET_DATA';

export default function spaceManagementSetData(hierarchy, spaces, doorways, labels) {
  return { type: SPACE_MANAGEMENT_SET_DATA, hierarchy, spaces, doorways, labels };
}
