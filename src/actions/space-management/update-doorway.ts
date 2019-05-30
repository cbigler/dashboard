import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import hideModal from '../../actions/modal/hide';
import pushDoorway from './push-doorway';

import core from '../../client/core';

export const SPACE_MANAGEMENT_UPDATE_DOORWAY = 'SPACE_MANAGEMENT_UPDATE_DOORWAY';

export default function spaceManagementUpdateDoorway(item) {
  return async dispatch => {
    let response;
    try {
      const response = await core().put(`/doorways/${item.id}`, {
        name: item.name,
        environment: {
          width: item.width,
          height: item.height,
          clearance: item.clearance,
          power_type: item.powerType,
        },
      }, { 
        params: { environment: true }
      });
    } catch (err) {
      dispatch(showToast({type: 'error', text: 'Error saving doorway'}));
      return;
    }

    dispatch(pushDoorway(response.data));
    dispatch(showToast({text: 'Doorway updated!'}));
    dispatch(hideModal());
  };
}
