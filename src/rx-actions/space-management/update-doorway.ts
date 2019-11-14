import uuid from 'uuid';

import { showToast, hideToast } from '../../rx-actions/toasts';
import hideModal from '../modal/hide';
import pushDoorway from './push-doorway';
import formDoorwayUpdate from './form-doorway-update';

import core from '../../client/core';
import uploadMedia from '../../helpers/media-files';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityDoorway } from '../../types';
import { fetchObject } from '../../helpers/fetch-all-objects';

export const SPACE_MANAGEMENT_UPDATE_DOORWAY = 'SPACE_MANAGEMENT_UPDATE_DOORWAY';

export async function uploadDoorwayImages(dispatch, doorwayId, item) {
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

  hideModal(dispatch);

  if (uploadPromises.length > 0) {
    const id = uuid.v4();
    showToast(dispatch, {
      id,
      text: `Processing doorway ${uploadPromises.length === 1 ? 'image' : 'images'}...`,
      timeout: null,
    });

    let mediaUploadResults;
    try {
      mediaUploadResults = await Promise.all(uploadPromises);
    } catch (e) {
      await hideToast(dispatch, id);
      showToast(dispatch, {
        type: 'error',
        text: 'Processing image failed',
      });
      return false;
    }

    await hideToast(dispatch, id);

    const imagesThatFailedProcessing = mediaUploadResults.filter(i => i.media.length === 0);
    if (imagesThatFailedProcessing.length > 0) {
      showToast(dispatch, {
        type: 'error',
        text: `Error processing ${imagesThatFailedProcessing.length === 1 ? 'image' : 'images'}`,
      });
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
      showToast(dispatch, {type: 'error', text: 'Error fetching updated doorway'});
      return false;
    }

    dispatch(pushDoorway(objectSnakeToCamel<DensityDoorway>(doorwayResponse.data)));
  }
  return true;
}

export default async function spaceManagementUpdateDoorway(dispatch, item) {
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
    showToast(dispatch, {type: 'error', text: 'Error saving doorway'});
    return;
  }

  dispatch(pushDoorway(response.data));

  // Separately update the sensor placement as even though it can be set in the doorway modal,
  // it's not a value that is stored on a doorway.
  dispatch(formDoorwayUpdate(item.id, 'linkId', item.linkId));
  dispatch(formDoorwayUpdate(item.id, 'sensorPlacement', item.sensorPlacement));
  dispatch(formDoorwayUpdate(item.id, 'updateHistoricCounts', item.updateHistoricCounts));
  dispatch(formDoorwayUpdate(item.id, 'operationToPerform', 'UPDATE'));

  await dispatch(uploadDoorwayImages(dispatch, response.data.id, item));

  showToast(dispatch, {text: 'Doorway updated!'});
}
