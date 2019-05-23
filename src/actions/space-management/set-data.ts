export const SPACE_MANAGEMENT_SET_DATA = 'SPACE_MANAGEMENT_SET_DATA';

export default function spaceManagementSetData(spaces, hierarchy, doorways, labels) {
  return { type: SPACE_MANAGEMENT_SET_DATA, spaces, hierarchy, doorways, labels };
}
