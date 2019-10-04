import { showToast } from '../../rx-actions/toasts';
import hideModal from '../modal/hide';

import core from '../../client/core';

export const SPACE_MANAGEMENT_DELETE_DOORWAY = 'SPACE_MANAGEMENT_DELETE_DOORWAY';

export default async function spaceManagementDeleteDoorway(dispatch, doorwayId) {
  try {
    await core().delete(`/doorways/${doorwayId}`);
  } catch (err) {
    showToast(dispatch, {type: 'error', text: 'Error deleting doorway'});
    return;
  }

  dispatch({type: SPACE_MANAGEMENT_DELETE_DOORWAY, doorwayId});
  showToast(dispatch, {text: 'Doorway deleted!'});
  hideModal(dispatch);
}
