import uuid from 'uuid';

import showModal from '../../actions/modal/show';
import showToast, { hideToast } from '../../actions/toasts';
import hideModal from '../../actions/modal/hide';
import pushDoorway from './push-doorway';
import formDoorwayUpdate from './form-doorway-update';

import core from '../../client/core';
import uploadMedia from '../../helpers/media-files';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityDoorway } from '../../types';

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

    dispatch(pushDoorway(response.data));

    // Seperately update the sensor placement as even though it can be set in the doorway modal,
    // it's not a value that is stored on a doorway.
    dispatch(formDoorwayUpdate(item.id, 'sensorPlacement', item.sensorPlacement));

    await dispatch(uploadDoorwayImages(response.data.id, item));

    dispatch(showToast({text: 'Doorway created!'}));
  };
}
