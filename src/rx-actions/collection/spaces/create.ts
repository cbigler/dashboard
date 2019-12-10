import uuid from 'uuid';
import moment from 'moment';
import collectionSpacesPush from './push';
import collectionSpacesError from './error';
import core from '../../../client/core';
import uploadMedia from '../../../helpers/media-files';
import { showToast, hideToast } from '../../../rx-actions/toasts';
import formatTagName from '../../../helpers/format-tag-name/index';

export const COLLECTION_SPACES_CREATE = 'COLLECTION_SPACES_CREATE';

const ONE_UTC_DAY_IN_SECONDS = moment.duration('24:00:00').as('seconds');
function convertSecondsIntoTime(seconds) {
  // normalize start / end times on the next day onto the current day.
  const secondsIntoDay = seconds % ONE_UTC_DAY_IN_SECONDS;

  return moment.utc()
    .startOf('day')
    .add(secondsIntoDay, 'seconds')
    .format('HH:mm:ss');
}

export default async function collectionSpacesCreate(dispatch, item) {
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

      inherits_time_segments: item.inheritsTimeSegments,
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
          return undefined;
        }
      }));
    }

    if (item.newImageFile) {
      const id = uuid();
      showToast(dispatch, {text: 'Processing...', timeout: 10000, id});
      const upload = await uploadMedia(`/uploads/space_image/${response.data.id}`, item.newImageFile);
      await hideToast(dispatch, id);
      if (upload instanceof Error) {
        showToast(dispatch, {text: 'Image must be JPG or PNG', type: 'error'});
      } else if (upload.media.length > 0) {
        response.data.imageUrl = upload.media[0].signedUrl;
      }
    } else {
      response.data.imageUrl = item.newImageData;
    }

    // When saving the space, create any links that were configured or changed in the doorways
    // module. Note that the only thing that can happen is that new links can be created -
    // "updating" or "deleting" isn't really relevant if the space didn't exist yet!
    if (item.links) {
      await Promise.all(item.links.map(async linkItem => {
        switch (linkItem.operationToPerform) {
        case 'CREATE':
          return core().post('/links', {
            space_id: response.data.id,
            doorway_id: linkItem.doorwayId,
            sensor_placement: linkItem.sensorPlacement,
            update_historical: linkItem.updateHistoricCounts,
          });
        default:
          return;
        }
      }));
    }

    if (item.newTags) {
      await Promise.all(item.newTags.map(async tag => {
        const tagName = formatTagName(tag.name);
        if (tag.operationToPerform === 'CREATE') {
          await core().post(`/spaces/${response.data.id}/tags`, { tag_name: tagName });
        } else if (tag.operationToPerform === 'DELETE') {
          await core().delete(`/spaces/${response.data.id}/tags/${tagName}`);
        }
      }));
    }

    if (item.newAssignedTeams) {
      await Promise.all(item.newAssignedTeams.map(async assignedTeam => {
        if (assignedTeam.operationToPerform === 'CREATE') {
          await core().post(`/spaces/${response.data.id}/assigned_teams`, { team_name: assignedTeam.name });
        } else if (assignedTeam.operationToPerform === 'DELETE') {
          await core().delete(`/spaces/${response.data.id}/assigned_teams/${assignedTeam.id}`);
        }
      }));
    }

    dispatch(collectionSpacesPush(response.data));
    return response.data;
  } catch (err) {
    dispatch(collectionSpacesError(err));
    return false;
  }
}
