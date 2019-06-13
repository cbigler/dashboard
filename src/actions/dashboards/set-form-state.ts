export const DASHBOARDS_SET_FORM_STATE = 'DASHBOARDS_SET_FORM_STATE';

export default function setFormState(formState) {
  return { type: DASHBOARDS_SET_FORM_STATE, formState };
}
