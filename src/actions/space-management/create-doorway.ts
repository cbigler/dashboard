import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import hideModal from '../../actions/modal/hide';
import pushDoorway from './push-doorway';

import core from '../../client/core';

export default function spaceManagementCreateDoorway(item) {
  return async dispatch => {
    let response;
    try {
      response = await core().post('/doorways', {
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

    console.log(response.data)
    dispatch(pushDoorway(response.data));
    dispatch(showToast({text: 'Doorway created!'}));
    dispatch(hideModal());
  };
}
