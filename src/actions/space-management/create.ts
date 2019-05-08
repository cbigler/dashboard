import moment from 'moment';

import fetchAllPages from '../../helpers/fetch-all-pages';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityTimeSegmentGroup } from '../../types';

import collectionSpacesCreate from '../../actions/collection/spaces/create';
import showToast from '../../actions/toasts';

import core from '../../client/core';
import updateTimeSegments from './time-segments';

export default function spaceManagementCreate(space, operatingHoursLog) {
  return async (dispatch, getState) => {
    const newSpace = await dispatch(collectionSpacesCreate(space));
    if (!newSpace) {
      dispatch(showToast({ type: 'error', text: 'Error creating space' }));
      return false;
    }

    await dispatch(updateTimeSegments(newSpace.id, operatingHoursLog));

    dispatch(showToast({ text: 'Space created!' }));
    return true;
  };
}
