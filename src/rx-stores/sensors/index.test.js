import assert from 'assert';
import { sensorsReducer, initialState } from './index';

import collectionSensorsSet from '../../rx-actions/collection/sensors/set';

describe('sensors', () => {
  it('should set sensors when given a bunch of sensors', () => {

    const result = sensorsReducer(initialState, collectionSensorsSet([
      {serial_number: 'Z123456', doorway_id: "drw_123"},
      {serial_number: 'Z654321', doorway_id: "drw_456"},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {serial_number: 'Z123456', doorway_id: "drw_123"},
        {serial_number: 'Z654321', doorway_id: "drw_456"},
      ],
    });
  });
});
