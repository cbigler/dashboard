
import assert from 'assert';
import fetchAllObjects from './index';

describe('fetch-all-objects', function() {
  it('should work', function() {
    assert.equal(fetchAllObjects(), true);
  });
});

