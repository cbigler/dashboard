import assert from 'assert';
import doorways from './index';

import collectionDoorwaysSet from '../../actions/collection/doorways/set';
import collectionDoorwaysPush from '../../actions/collection/doorways/push';
import collectionDoorwaysFilter from '../../actions/collection/doorways/filter';
import collectionDoorwaysDelete from '../../actions/collection/doorways/delete';
import collectionDoorwaysError from '../../actions/collection/doorways/error';
import { COLLECTION_DOORWAYS_UPDATE } from '../../actions/collection/doorways/update';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

const SENSOR_ID_ONE = 'sen_3wxsa6e8dh5zdnf73ubpnaq37wz2nawcjw8hh5sfawb';
const SENSOR_ID_TWO = 'sen_aus86m8834xef4cqjeye2hzz3u8j5aafucxjgkn695h';

describe('doorways', function() {
  it('should set doorways when given a bunch of doorways', function() {
    const initialState = doorways(undefined, {});

    const result = doorways(initialState, collectionDoorwaysSet([
      {id: 0, name: 'foo', sensor_id: SENSOR_ID_ONE},
      {id: 1, name: 'bar', sensor_id: SENSOR_ID_TWO},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {id: 0, name: 'foo', sensorId: SENSOR_ID_ONE},
        {id: 1, name: 'bar', sensorId: SENSOR_ID_TWO},
      ],
    });
  });
  it('should push doorway when given a doorway update', function() {
    const initialState = doorways(undefined, {});

    // Add a new doorway.
    const doorwayInCollection = doorways(initialState, collectionDoorwaysPush({
      id: 0,
      name: 'foo',
      sensor_id: SENSOR_ID_ONE
    }));

    // Update doorway in collection
    const doorwayUpdatedInCollection = doorways(doorwayInCollection, collectionDoorwaysPush({
      id: 0,
      name: 'new name',
    }));

    assert.deepEqual(doorwayUpdatedInCollection, {
      ...initialState,
      loading: false,
      data: [{id: 0, name: 'new name', sensorId: SENSOR_ID_ONE}],
    });
  });
  it('should push doorway when given a new doorway', function() {
    const initialState = doorways(undefined, {});

    const result = doorways(initialState, collectionDoorwaysPush({
      id: 0,
      name: 'foo',
      sensor_id: SENSOR_ID_ONE
    }));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [{id: 0, name: 'foo', sensorId: SENSOR_ID_ONE}],
    });
  });
  it('should filter doorway collection when given a filter', function() {
    const initialState = doorways(undefined, {});

    const result = doorways(initialState, collectionDoorwaysFilter('search', 'foo'));

    assert.deepEqual(result, {
      ...initialState,
      filters: {...initialState.filters, search: 'foo'},
    });
  });
  it('should delete a doorway from the doorways collection', function() {
    const initialState = doorways(undefined, {});

    const DOORWAY = {
      id: 0,
      name: 'foo',
      current_count: 5,
    };

    // Add a doorway, then delete a doorway
    const doorwayInCollection = doorways(initialState, collectionDoorwaysPush(DOORWAY));
    const result = doorways(doorwayInCollection, collectionDoorwaysDelete(DOORWAY));

    // Initial state should then match final state.
    assert.deepEqual(result, {...initialState, loading: false});
  });
  it('should set an error when an error happens', function() {
    const initialState = doorways(undefined, {});

    // Issue an error into the doorways collection.
    const errorState = doorways(initialState, collectionDoorwaysError('boom!'));

    // Then, make sure that the error state was set.
    assert.deepEqual(errorState, {...initialState, error: 'boom!', loading: false});
  });
  it('should clear an error when an async operation starts.', function() {
    const initialState = doorways(undefined, {});

    // Add an error to the state.
    const errorState = doorways(initialState, collectionDoorwaysError('boom!'));

    // Then, update a space.
    const state = doorways(errorState, {type: COLLECTION_DOORWAYS_UPDATE});

    // Initial state should then have error: null
    assert.deepEqual(state, {...initialState, error: null, loading: true});
  });
});
