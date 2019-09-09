import showToast from '../../actions/toasts';
import pushDoorway from './push-doorway';
import core from '../../client/core';

import { uploadDoorwayImages } from './update-doorway';

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

    dispatch(pushDoorway(
      response.data,

      // Seperately specify the sensor placement as even though it can be set in the doorway modal,
      // it's not a value that is stored on a doorway.
      item.sensorPlacement,
    ));

    await dispatch(uploadDoorwayImages(response.data.id, item));

    dispatch(showToast({text: 'Doorway created!'}));
  };
}
