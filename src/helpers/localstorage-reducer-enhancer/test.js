import assert from 'assert';
import localstorageReducerEnhancer from './';

describe('localstorage-reducer-enhancer', function() {
  it('should work', function() {
    function reducer(state, action) {
      return action.value;
    }

    global.localStorage = localStorage = {};

    const enhancedReducer = localstorageReducerEnhancer('foo')(reducer);
    const response = enhancedReducer('initialState', {
      type: 'MY_ACTION',
      value: 'changedState',
    });

    assert.equal(response, 'changedState');
    assert.equal(localStorage.foo, 'changedState');
  });
});

