import uuid from 'uuid';

import showToast, { hideToast } from '../../actions/toasts';
import hideModal from '../../actions/modal/hide';
import pushDoorway from './push-doorway';
import formDoorwayUpdate from './form-doorway-update';

import core from '../../client/core';
import uploadMedia from '../../helpers/media-files';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityDoorway } from '../../types';
import { fetchObject } from '../../helpers/fetch-all-objects';

export const SPACE_MANAGEMENT_UPDATE_DOORWAY = 'SPACE_MANAGEMENT_UPDATE_DOORWAY';

export function uploadDoorwayImages(doorwayId, item) {
  return async dispatch => {
    // Check inside and outside image url, upload them to the doorway if they are newly added
    const uploadPromises: Array<Promise<any>> = [];
    if (item.newInsideImageFile) {
      uploadPromises.push(
        uploadMedia(`/uploads/doorway_image/${doorwayId}/inside`, item.newInsideImageFile),
      );
    }
    if (item.newOutsideImageFile) {
      uploadPromises.push(
        uploadMedia(`/uploads/doorway_image/${doorwayId}/outside`, item.newOutsideImageFile),
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

      let mediaUploadResults;
      try {
        mediaUploadResults = await Promise.all(uploadPromises);
      } catch (e) {
        await dispatch(hideToast(id));
        dispatch(showToast({
          type: 'error',
          text: 'Processing image failed',
        }));
        return false;
      }

      await dispatch(hideToast(id));

      const imagesThatFailedProcessing = mediaUploadResults.filter(i => i.media.length === 0);
      if (imagesThatFailedProcessing.length > 0) {
        dispatch(showToast({
          type: 'error',
          text: `Error processing ${imagesThatFailedProcessing.length === 1 ? 'image' : 'images'}`,
        }));
        return false;
      }

      // After uploading, refetch the doorway to get the latest doorway information with the images
      // inside.
      let doorwayResponse;
      try {
        doorwayResponse = await fetchObject<DensityDoorway>(`/doorways/${doorwayId}`, {
          params: { environment: true }
        });
      } catch (err) {
        dispatch(showToast({type: 'error', text: 'Error fetching updated doorway'}));
        return false;
      }

      dispatch(pushDoorway(objectSnakeToCamel<DensityDoorway>(doorwayResponse.data)));
    }
    return true;
  };
}

export default function spaceManagementUpdateDoorway(item) {
  return async dispatch => {
    let response;
    try {
      response = await core().put(`/doorways/${item.id}`, {
        name: item.name,
        environment: {
          measurement_unit: item.measurementUnit,
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

    dispatch(showToast({text: 'Doorway updated!'}));
  };
}