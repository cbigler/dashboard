import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SENSORS_SET } from '../../rx-actions/collection/sensors/set';

import { DensitySensor } from '../../types';
import createRxStore from '..';


export type SensorsState = {
  loading: boolean,
  error: unknown,
  data: DensitySensor[],
}

export const initialState: SensorsState = {
  loading: true,
  error: null,
  data: [],
};

// FIXME: action should be GlobalAction
export function sensorsReducer(state: SensorsState, action: Any<FixInRefactor>): SensorsState {
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

const SensorsStore = createRxStore('SensorsStore', initialState, sensorsReducer);
export default SensorsStore;
