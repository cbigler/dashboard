export const SPACE_MANAGEMENT_UPDATE_FORM_STATE = 'SPACE_MANAGEMENT_UPDATE_FORM_STATE';

export default function spaceManagementUpdateFormState(key, value) {
  return { type: SPACE_MANAGEMENT_UPDATE_FORM_STATE, key, value };
}
