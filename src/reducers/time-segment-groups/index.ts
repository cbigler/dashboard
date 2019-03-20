import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_TIME_SEGMENT_GROUPS_SET } from '../../actions/collection/time-segment-groups/set';
import { COLLECTION_TIME_SEGMENT_GROUPS_ERROR } from '../../actions/collection/time-segment-groups/error';

import { DensityTimeSegment } from '../../types';

const initialState = {
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
      loading: false,
      error: null,
      data: action.data.map(t => objectSnakeToCamel<DensityTimeSegment>(t)),
    };

  // An error occurred.
  case COLLECTION_TIME_SEGMENT_GROUPS_ERROR:
    return {...state, loading: false, error: action.error};

  default:
    return state;
  }
}
