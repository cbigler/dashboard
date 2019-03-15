export const UPDATE_MODAL = 'UPDATE_MODAL';

export default function updateModal(field, value) {
  return { type: UPDATE_MODAL, data: { [field]: value } };
}
