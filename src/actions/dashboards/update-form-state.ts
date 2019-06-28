export const DASHBOARDS_UPDATE_FORM_STATE = 'DASHBOARDS_UPDATE_FORM_STATE';

export default function updateFormState(key, value) {
  return { type: DASHBOARDS_UPDATE_FORM_STATE, key, value };
}
