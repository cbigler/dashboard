import uuid from 'uuid';
import moment from 'moment';
import fetchAllPages from '../../../helpers/fetch-all-pages/index';
import objectSnakeToCamel from '../../../helpers/object-snake-to-camel/index';
import { DensitySpace } from '../../../types';
import formatTagName from '../../../helpers/format-tag-name/index';

import collectionSpacesSet from './set';
import collectionSpacesError from './error';
import core from '../../../client/core';
import uploadMedia from '../../../helpers/media-files';
import showToast, { hideToast } from '../../toasts';

export const COLLECTION_SPACES_UPDATE = 'COLLECTION_SPACES_UPDATE';

const ONE_UTC_DAY_IN_SECONDS = moment.duration('24:00:00').as('seconds');
function convertSecondsIntoTime(seconds) {
  // normalize start / end times on the next day onto the current day.
  const secondsIntoDay = seconds % ONE_UTC_DAY_IN_SECONDS;

  return moment.utc()
    .startOf('day')
    .add(seconds, 'seconds')
    .format('HH:mm:ss');
}

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

        inherits_time_segments: item.inheritsTimeSegments,
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
        const id = uuid.v4();
        dispatch(showToast({text: 'Processing...', timeout: 10000, id}));
        await uploadMedia(`/uploads/space_image/${item.id}`, item.newImageFile);
        dispatch(hideToast(id));
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

      // Fetch all spaces after updating this space. If we changed this space's size area unit, then
      // the size area unit of child spaces will update too.
      const rawSpaces = await fetchAllPages(async page => {
        const response = await core().get(`/spaces`, {
          params: {
            page,
            page_size: 5000,
          },
        });
        return response.data;
      });
      const spaces = rawSpaces.map(d => objectSnakeToCamel<DensitySpace>(d));
      dispatch(collectionSpacesSet(spaces));
      return spaces;

    } catch (err) {
      console.error(err);
      dispatch(collectionSpacesError(err));
      return false;
    }
  };
}
