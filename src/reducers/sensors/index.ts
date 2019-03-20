import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SENSORS_SET } from '../../actions/collection/sensors/set';

import { DensitySensor } from '../../types';

const initialState = {
  loading: true,
  error: null,
  data: [],
};

export default function sensors(state=initialState, action) {
  switch (action.type) {

  // Update the whole sensors collection.
  case COLLECTION_SENSORS_SET:
    return {
      ...state,
      loading: false,
      error: null,
      data: action.data.map(s => objectSnakeToCamel<DensitySensor>(s)),
    };

  default:
    return state;
  }
}
