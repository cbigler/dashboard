import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import core from '../../../client/core';
import uploadMedia from '../../../helpers/media-files';
import showToast from '../../toasts';

export const COLLECTION_SPACES_CREATE = 'COLLECTION_SPACES_CREATE';

export default function collectionSpacesCreate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_CREATE, item });

    try {
      const response = await core().post('/spaces', {
        name: item.name,
        description: item.description,
        parent_id: item.parentId,
        space_type: item.spaceType,
        'function': item['function'],

        annual_rent: item.annualRent,
        size_area: item.sizeArea,
        size_area_unit: item.sizeAreaUnit,
        currency_unit: item.currencyUnit,
        capacity: item.capacity,
        target_capacity: item.targetCapacity,
        floor_level: item.floorLevel,

        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        time_zone: item.timeZone,
        daily_reset: item.dailyReset,
      });
      if (item.newImageFile) {
        dispatch(showToast({text: 'Processing...'}));
        const upload = await uploadMedia(`/uploads/space_image/${response.data.id}`, item.newImageFile);
        response.data.image = upload.media[0].signedUrl;
      } else {
        response.data.image = item.newImageData;
      }
      dispatch(collectionSpacesPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
