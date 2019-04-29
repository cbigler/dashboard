import collectionSpacesPush from './push';
import collectionSpacesSet from './set';
import collectionSpacesError from './error';
import core from '../../../client/core';

export const COLLECTION_SPACES_UPDATE = 'COLLECTION_SPACES_UPDATE';

export default function collectionSpacesUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_SPACES_UPDATE, item });

    let response;
    try {
      response = await core().put(`/spaces/${item.id}`, {
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
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }

    // Fetch all spaces after updating this space. If we changed this space's size area unit, then
    // the size area unit of child spaces will update too.
    let response2;
    try {
      response2 = await core().get('/spaces');
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }

    dispatch(collectionSpacesSet(response2.data));

    return response.data;
  };
}
