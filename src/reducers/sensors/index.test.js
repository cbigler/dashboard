import assert from 'assert';
import sensors from './index';

import collectionSensorsSet from '../../actions/collection/sensors/set';

describe('sensors', function() {
  it('should set sensors when given a bunch of sensors', function() {
    const initialState = sensors(undefined, {});

    const result = sensors(initialState, collectionSensorsSet([
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
