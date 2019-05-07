import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_TIME_SEGMENT_GROUPS_SET } from '../../actions/collection/time-segment-groups/set';
import { COLLECTION_TIME_SEGMENT_GROUPS_ERROR } from '../../actions/collection/time-segment-groups/error';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../actions/route-transition/admin-locations-edit';

import { DensityTimeSegment } from '../../types';

const initialState = {
  view: 'LOADING',
  loading: true,
  selected: null,
  error: null,
  data: [],
};

export default function timeSegmentGroups(state=initialState, action) {
  switch (action.type) {

  // Update the whole time segment collection.
  case COLLECTION_TIME_SEGMENT_GROUPS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      error: null,
      data: action.data.map(t => objectSnakeToCamel<DensityTimeSegment>(t)),
    };

  // An error occurred.
  case COLLECTION_TIME_SEGMENT_GROUPS_ERROR:
    return {...state, view: 'ERROR', loading: false, error: action.error};

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return { ...state, view: 'LOADING', error: null, data: [], loading: false };

  default:
    return state;
  }
}
