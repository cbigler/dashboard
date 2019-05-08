import moment from 'moment';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityTimeSegmentGroup } from '../../types';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import showToast from '../../actions/toasts';

import core from '../../client/core';
import updateTimeSegments from './time-segments';

export default function spaceManagementUpdate(id, spaceFieldUpdate, operatingHoursLog) {
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

    await dispatch(updateTimeSegments(id, operatingHoursLog));

    dispatch(showToast({ text: 'Space updated successfully' }));
    return true;
  };
}
