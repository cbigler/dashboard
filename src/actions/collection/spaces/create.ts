import uuid from 'uuid';
import moment from 'moment';
import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import core from '../../../client/core';
import uploadMedia from '../../../helpers/media-files';
import showToast, { hideToast } from '../../toasts';

export const COLLECTION_SPACES_CREATE = 'COLLECTION_SPACES_CREATE';

const ONE_UTC_DAY_IN_SECONDS = moment.duration('24:00:00').as('seconds');
function convertSecondsIntoTime(seconds) {
  // normalize start / end times on the next day onto the current day.
  const secondsIntoDay = seconds % ONE_UTC_DAY_IN_SECONDS;

  return moment.utc()
    .startOf('day')
    .add(seconds, 'seconds')
    .format('HH:mm:ss');
}

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

      if (item.operatingHours) {
        await Promise.all(item.operatingHours.map(operatingHoursItem => {
          switch (operatingHoursItem.operationToPerform) {
          case 'CREATE':
            return core().post('/time_segments', {
              label: operatingHoursItem.label,
              start: convertSecondsIntoTime(operatingHoursItem.startTimeSeconds),
              end: convertSecondsIntoTime(operatingHoursItem.endTimeSeconds),
              days: operatingHoursItem.daysAffected,
              spaces: [ response.data.id ],
            });
          case 'UPDATE':
            return core().put(`/time_segments/${operatingHoursItem.id}`, {
              label: operatingHoursItem.label,
              start: convertSecondsIntoTime(operatingHoursItem.startTimeSeconds),
              end: convertSecondsIntoTime(operatingHoursItem.endTimeSeconds),
              days: operatingHoursItem.daysAffected,
              spaces: [ response.data.id ],
            });
          case 'DELETE':
            return core().delete(`/time_segments/${operatingHoursItem.id}`);
          default:
            return;
          }
        }));
      }

      if (item.newImageFile) {
        const id = uuid();
        dispatch(showToast({text: 'Processing...', timeout: 10000, id}));
        const upload = await uploadMedia(`/uploads/space_image/${response.data.id}`, item.newImageFile);
        dispatch(hideToast(id));
        if (upload.media.length > 0) {
          response.data.imageUrl = upload.media[0].signedUrl;
        }
      } else {
        response.data.imageUrl = item.newImageData;
      }

      dispatch(collectionSpacesPush(response.data));
      return response.data;
    } catch (err) {
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
