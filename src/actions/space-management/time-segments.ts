import moment from 'moment';
import uuid from 'uuid';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityTimeSegmentGroup } from '../../types';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import showToast from '../../actions/toasts';

import core from '../../client/core';

// When modifying an operating hours item, tag it with the operation that must be done to correctly
// update the server
export const TIME_SEGMENT_CREATE = 'TIME_SEGMENT_CREATE',
             TIME_SEGMENT_UPDATE = 'TIME_SEGMENT_UPDATE',
             TIME_SEGMENT_DELETE = 'TIME_SEGMENT_DELETE',
             TIME_SEGMENT_GROUP_CREATE = 'TIME_SEGMENT_GROUP_CREATE',
             TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP = 'TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP';

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

export default function updateTimeSegments(id, operatingHoursLog) {
  return async (dispatch, getState) => {
    // Newly created time segments or time segment groups need to be given an id so that they can be
    // managed in react. But, later entries in the log need to include these ids as parameters. So,
    // after creating something, store its id in this object, and anytime that an id needs to be
    // used, wrap it in a call to getId.
    const tempIdsToRealIds = {};
    function getId(id) {
      if (tempIdsToRealIds[id]) {
        return tempIdsToRealIds[id];
      } else {
        return id;
      }
    }

    try {
      await operatingHoursLog.reduce(async (last, entry) => {
        await last;

        switch (entry.action) {
        case TIME_SEGMENT_CREATE:
          const timeSegmentResponse = await core().post('/time_segments', {
            name: uuid.v4(),
            start: convertSecondsIntoTime(entry.data.startTimeSeconds),
            end: convertSecondsIntoTime(entry.data.endTimeSeconds),
            days: entry.data.daysAffected,
            spaces: [ id ],
          });

          tempIdsToRealIds[entry.id] = timeSegmentResponse.data.id;
          return timeSegmentResponse;

        case TIME_SEGMENT_UPDATE:
          return core().put(`/time_segments/${getId(entry.id)}`, {
            start: convertSecondsIntoTime(entry.data.startTimeSeconds),
            end: convertSecondsIntoTime(entry.data.endTimeSeconds),
            days: entry.data.daysAffected,
            spaces: [ id ],
          });

        case TIME_SEGMENT_DELETE:
          return core().delete(`/time_segments/${getId(entry.id)}`);

        case TIME_SEGMENT_GROUP_CREATE:
          const timeSegmentGroupResponse = await core().post('/time_segment_groups', {
            name: entry.data.name,
            time_segments: entry.data.timeSegments || [],
          });

          tempIdsToRealIds[entry.id] = timeSegmentGroupResponse.data.id;
          return timeSegmentGroupResponse;

        case TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP:
          const timeSegmentId = entry.timeSegmentId;
          const timeSegmentGroupId = entry.timeSegmentGroupId;

          const output = await Promise.all([
            // Remove this time segment from all other time segment groups it is part of. This is
            // required so that a time segment always only is in one time segment group.
            Promise.all(getState().timeSegmentGroups.data.map(async tsg => {
              // Is the time segment specified in the entry in any time segment group?
              if (tsg.timeSegments.find(i => i.timeSegmentId === timeSegmentId)) {
                // If so, remove it.
                await core().put(`/time_segment_groups/${getId(tsg.id)}`, {
                  time_segments: tsg.timeSegments
                    .map(i => i.timeSegmentId)
                    .filter(i => i !== timeSegmentId)
                });
              }
            })),

            // Fetch the details for the time segment group
            objectSnakeToCamel<DensityTimeSegmentGroup>(
              (await core().get(`/time_segment_groups/${getId(timeSegmentGroupId)}`)).data
            ),
          ]);
          const timeSegmentGroup = output[1];

          return core().put(`/time_segment_groups/${getId(timeSegmentGroupId)}`, {
            time_segments: [
              ...timeSegmentGroup.timeSegments.map(t => t.timeSegmentId),
              getId(timeSegmentId),
            ],
          });

        default:
          return;
        }
      }, Promise.resolve());
    } catch (err) {
      console.error(err);
      dispatch(showToast({ type: 'error', text: `Error updating operating hours` }));
      return false;
    }
    return true;
  };
}
