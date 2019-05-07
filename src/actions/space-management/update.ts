import moment from 'moment';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityTimeSegmentGroup } from '../../types';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import showToast from '../../actions/toasts';

import core from '../../client/core';

// When modifying an operating hours item, tag it with the operation that must be done to correctly
// update the server
export const OPERATING_HOURS_CREATE = 'OPERATING_HOURS_CREATE',
             OPERATING_HOURS_UPDATE = 'OPERATING_HOURS_UPDATE',
             OPERATING_HOURS_DELETE = 'OPERATING_HOURS_DELETE';

export type OperatingHoursItem = {
  id: string,
  labelId: string | null,
  startTimeSeconds: number,
  endTimeSeconds: number,
  daysAffected: Array<string>,
  actionToPerform: 'OPERATION_CREATE' | 'OPERATION_UPDATE' | 'OPERATION_DELETE' | null,
};
export type OperatingHoursLabelItem = {
  id: string,
  name: string,
  actionToPerform: 'CREATE' | 'UPDATE' | null,
};

const ONE_UTC_DAY_IN_SECONDS = 84000;
function convertSecondsIntoTime(seconds) {
  // normalize start / end times on the next day onto the current day.
  const secondsIntoDay = seconds % ONE_UTC_DAY_IN_SECONDS;

  return moment.utc()
    .startOf('day')
    .add(seconds, 'seconds')
    .format('HH:mm:ss');
}

export default function spaceManagementUpdate(
  id,
  spaceFieldUpdate,
  operatingHours,
  operatingHoursLabels,
) {
  return async (dispatch, getState) => {
    const ok = await dispatch(collectionSpacesUpdate({
      id,
      ...spaceFieldUpdate,
      timeSegmentGroups: [],
    }));
    if (!ok) {
      dispatch(showToast({ type: 'error', text: 'Error updating space' }));
      return false;
    }

    // BEGIN TIME SEGMENTS UPDATE LOGIC
    const newlyCreatedTimeSegmentIds = {};

    const timeSegmentRequests = operatingHours.map(async item => {
      const label = operatingHoursLabels.find(i => i.id === item.labelId);
      const labelName = label ? label.name : 'Unknown Label';

      switch (item.actionToPerform) {
      case OPERATING_HOURS_CREATE:
        console.log('CREATE TIME SEGMENT', labelName, item);
        const createResponse = await core().post('/time_segments', {
          name: labelName,
          start: convertSecondsIntoTime(item.startTimeSeconds),
          end: convertSecondsIntoTime(item.endTimeSeconds),
          days: item.daysAffected,
          spaces: [ id ],
        });
        console.log(' => ', createResponse.data);

        // Store a mapping from the old "temporary" id to the new server-generated id, this is
        // needed later.
        newlyCreatedTimeSegmentIds[item.id] = createResponse.data.id;

        return createResponse;

      case OPERATING_HOURS_UPDATE:
        console.log('UPDATE TIME SEGMENT', labelName, item);
        const updateResponse = await core().put(`/time_segments/${item.id}`, {
          name: labelName,
          start: convertSecondsIntoTime(item.startTimeSeconds),
          end: convertSecondsIntoTime(item.endTimeSeconds),
          days: item.daysAffected,
          spaces: [ id ],
        });
        console.log(' => ', updateResponse.data.id);
        return updateResponse;

      case OPERATING_HOURS_DELETE:
        console.log('DELETE TIME SEGMENT', item);
        return core().delete(`/time_segments/${item.id}`);

      default:
        // No change to this time segment!
        return null;
      }
    });

    try {
      await Promise.all(timeSegmentRequests);
    } catch (err) {
      console.error(err);
      dispatch(showToast({ type: 'error', text: `Error updating operating hours` }));
      return false;
    }

    function labelLinkedToSpace(label) {
      return operatingHours.find(o => o.labelId === label.id);
    }

    await Promise.all(operatingHoursLabels.map(async op => {
      await core().put(`/time_segment_groups/${op.id}`, {
        time_segments: [],
      });
    }));

    // Only include labels that are in use by operating hours on the page
    const timeSegmentsAssociatedWithSpaces = operatingHoursLabels.filter(l => labelLinkedToSpace(l))

    const timeSegmentGroupRequests = operatingHoursLabels.map(label => {
      // Find all time segments that should be put into this time segment group.
      // Check to see if the id is in `newlyCreatedTimeSegmentIds`, and if so, use the server id
      // instead of the locally generated uuid.
      const matchingTimeSegmentIds = operatingHours
        .filter(o => o.actionToPerform !== OPERATING_HOURS_DELETE)
        .filter(o => o.labelId === label.id)
        .map(o => newlyCreatedTimeSegmentIds[o.id] || o.id);

      if (label.actionToPerform === OPERATING_HOURS_CREATE) {
        console.log('CREATE TIME SEGMENT GROUP', label, matchingTimeSegmentIds)
        return core().post('/time_segment_groups', {
          name: label.name,
          time_segments: matchingTimeSegmentIds,
        });
      } else {
        console.log('UPDATE TIME SEGMENT GROUP', label, matchingTimeSegmentIds)
        return core().put(`/time_segment_groups/${label.id}`, {
          name: label.name,
          time_segments: matchingTimeSegmentIds,
        });
      }
    });

    try {
      await Promise.all(timeSegmentGroupRequests);
    } catch (err) {
      console.error(err);
      dispatch(showToast({ type: 'error', text: `Error updating operating hours labels` }));
      return false;
    }

    // END TIME SEGMENTS UPDATE LOGIC

    dispatch(showToast({ text: 'Space updated successfully' }));
    return true;
  };
}
