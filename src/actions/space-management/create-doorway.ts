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

    // Check inside and outside image url, upload them to the doorway if they are newly added
    const uploadPromises: Array<Promise<any>> = [];
    if (item.newInsideImageFile) {
      uploadPromises.push(
        uploadMedia(`/uploads/doorway_image/${response.data.id}/inside`, item.newInsideImageFile),
      );
    }
    if (item.newOutsideImageFile) {
      uploadPromises.push(
        uploadMedia(`/uploads/doorway_image/${response.data.id}/outside`, item.newOutsideImageFile),
      );
    }

    dispatch(hideModal());

    if (uploadPromises.length > 0) {
      const id = uuid.v4();
      dispatch(showToast({
        id,
        text: `Processing doorway ${uploadPromises.length === 1 ? 'image' : 'images'}...`,
        timeout: null,
      }));

      try {
        await Promise.all(uploadPromises);
      } catch (e) {
        await dispatch(hideToast(id));
        dispatch(showToast({
          type: 'error',
          text: 'Processing image failed',
        }));
        return;
      }

      await dispatch(hideToast(id));

      // After uploading, refetch the doorway to get the latest doorway information with the iamges
      // inside.
      let doorwayResponse;
      try {
        doorwayResponse = await core().get(`/doorways/${item.id}`, { params: { environment: true } });
      } catch (err) {
        dispatch(showToast({type: 'error', text: 'Error fetching updated doorway'}));
        return;
      }

      dispatch(pushDoorway(objectSnakeToCamel<DensityDoorway>(doorwayResponse.data)));
    }

    dispatch(showToast({text: 'Doorway updated!'}));
  };
}
