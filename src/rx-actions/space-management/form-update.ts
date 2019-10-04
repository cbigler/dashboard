export const SPACE_MANAGEMENT_FORM_UPDATE = 'SPACE_MANAGEMENT_FORM_UPDATE';

export default function spaceManagementFormUpdate(key, value) {
  return { type: SPACE_MANAGEMENT_FORM_UPDATE, key, value };
}
