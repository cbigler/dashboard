import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import hideModal from '../../actions/modal/hide';
import pushDoorway from './push-doorway';

import core from '../../client/core';

export const SPACE_MANAGEMENT_DELETE_DOORWAY = 'SPACE_MANAGEMENT_DELETE_DOORWAY';

export default function spaceManagementDeleteDoorway(doorwayId) {
  return async dispatch => {
    let response;
    try {
      response = await core().delete(`/doorways/${doorwayId}`);
    } catch (err) {
      dispatch(showToast({type: 'error', text: 'Error deleting doorway'}));
      return;
    }

    dispatch({type: SPACE_MANAGEMENT_DELETE_DOORWAY, doorwayId});
    dispatch(showToast({text: 'Doorway deleted!'}));
    dispatch(hideModal());
  };
}
