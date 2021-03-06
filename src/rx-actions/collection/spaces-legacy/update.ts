import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import fetchAllObjects from '../../../helpers/fetch-all-objects';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import formatTagName from '../../../helpers/format-tag-name/index';

import collectionSpacesSet from './set';
import collectionSpacesError from './error';
import core from '../../../client/core';
import uploadMedia from '../../../helpers/media-files';
import { showToast, hideToast } from '../../toasts';

export const COLLECTION_SPACES_UPDATE = 'COLLECTION_SPACES_UPDATE';

const ONE_UTC_DAY_IN_SECONDS = moment.duration('24:00:00').as('seconds');
function convertSecondsIntoTime(seconds) {
  // normalize start / end times on the next day onto the current day.
  const secondsIntoDay = seconds % ONE_UTC_DAY_IN_SECONDS;

  return moment.utc()
    .startOf('day')
    .add(secondsIntoDay, 'seconds')
    .format('HH:mm:ss');
}

export default async function collectionSpacesUpdate(dispatch, item) {
  dispatch({ type: COLLECTION_SPACES_UPDATE, item });

  try {
    await core().put(`/spaces/${item.id}`, {
      name: item.name,
      description: item.description,
      parent_id: item.parent_id,
      space_type: item.space_type,
      'function': item['function'],

      annual_rent: item.annual_rent,
      size_area: item.size_area,
      size_area_unit: item.size_area_unit,
      currency_unit: item.currencyUnit,
      capacity: item.capacity,
      target_capacity: item.target_capacity,
      floor_level: item.floor_level,

      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      time_zone: item.time_zone,
      daily_reset: item.daily_reset,

      inherits_time_segments: item.inherits_time_segments,
    });

    if (item.operatingHours) {
      await Promise.all(item.operatingHours.map(async operatingHoursItem => {
        switch (operatingHoursItem.operationToPerform) {

        case 'CREATE':
          return core().post('/time_segments', {
            label: operatingHoursItem.label,
            start: convertSecondsIntoTime(operatingHoursItem.startTimeSeconds),
            end: convertSecondsIntoTime(operatingHoursItem.endTimeSeconds),
            days: operatingHoursItem.daysAffected,
            spaces: [ item.id ],
          });

        case 'UPDATE':
          return core().put(`/time_segments/${operatingHoursItem.id}`, {
            label: operatingHoursItem.label,
            start: convertSecondsIntoTime(operatingHoursItem.startTimeSeconds),
            end: convertSecondsIntoTime(operatingHoursItem.endTimeSeconds),
            days: operatingHoursItem.daysAffected,
            // don't update `spaces`: if a time segment is linked to multiple spaces, we want to
            // maintain those links even if it is just being updated on one space.
          });

        case 'DELETE':
          return core().delete(`/time_segments/${operatingHoursItem.id}`);

        default:
          return;
        }
      }));
    }

    // Upload any new image data for this space
    // Wait for the image to be complete, but ignore it (we overwrite all spaces below)
    if (item.newImageFile) {
      const id = uuidv4();
      showToast(dispatch, {text: 'Processing...', timeout: 10000, id});
      const upload = await uploadMedia(`/uploads/space_image/${item.id}`, item.newImageFile);
      await hideToast(dispatch, id);
      if (upload instanceof Error) {
        showToast(dispatch, {text: 'Image must be JPG or PNG', type: 'error'});
      }
    }

    if (item.newTags) {
      await Promise.all(item.newTags.map(async tag => {
        const tagName = formatTagName(tag.name);
        if (tag.operationToPerform === 'CREATE') {
          await core().post(`/spaces/${item.id}/tags`, { tag_name: tagName });
        } else if (tag.operationToPerform === 'DELETE') {
          await core().delete(`/spaces/${item.id}/tags/${tagName}`);
        }
      }));
    }

    if (item.newAssignedTeams) {
      await Promise.all(item.newAssignedTeams.map(async assignedTeam => {
        if (assignedTeam.operationToPerform === 'CREATE') {
          await core().post(`/spaces/${item.id}/assigned_teams`, { team_name: assignedTeam.name });
        } else if (assignedTeam.operationToPerform === 'DELETE') {
          await core().delete(`/spaces/${item.id}/assigned_teams/${assignedTeam.id}`);
        }
      }));
    }

    // When saving the space, update any links that were configured or changed in the doorways
    // module.
    if (item.links) {
      await Promise.all(item.links.map(async linkItem => {
        switch (linkItem.operationToPerform) {
        case 'CREATE':
          return await core().post('/links', {
            space_id: item.id,
            doorway_id: linkItem.doorway_id,
            sensor_placement: linkItem.sensor_placement,
            update_historical: linkItem.updateHistoricCounts,
          });
        case 'UPDATE':
          return await core().post(`/links/${linkItem.id}/set_placement`, {
            sensor_placement: linkItem.sensor_placement,
            update_historical: linkItem.updateHistoricCounts,
          });
        case 'DELETE':
          return await core().delete(`/links/${linkItem.id}`);
        default:
          return;
        }
      }));
    }

    // Fetch all spaces after updating this space. If we changed this space's size area unit, then
    // the size area unit of child spaces will update too.
    const spaces = await fetchAllObjects<CoreSpace>('/spaces');
    dispatch(collectionSpacesSet(spaces));
    return spaces;

  } catch (err) {
    console.error(err);
    dispatch(collectionSpacesError(err));
    return false;
  }
}
