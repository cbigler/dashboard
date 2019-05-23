export const SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE = 'SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE';

export default function spaceManagementFormDoorwayUpdate(id, key, value) {
  return { type: SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE, id, key, value };
}
