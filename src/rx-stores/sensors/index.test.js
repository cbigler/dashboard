import assert from 'assert';
import { sensorsReducer, initialState } from './index';

import collectionSensorsSet from '../../rx-actions/collection/sensors/set';

describe('sensors', () => {
  it('should set sensors when given a bunch of sensors', () => {

    const result = sensorsReducer(initialState, collectionSensorsSet([
      {serialNumber: 'Z123456', doorwayId: "drw_123"},
      {serialNumber: 'Z654321', doorwayId: "drw_456"},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {serialNumber: 'Z123456', doorwayId: "drw_123"},
        {serialNumber: 'Z654321', doorwayId: "drw_456"},
      ],
    });
  });
});
