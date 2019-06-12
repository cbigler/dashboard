
import assert from 'assert';
import setFeatureFlag from './index';

describe('set-feature-flag', function() {
  it('should work', function() {
    assert.equal(setFeatureFlag(), true);
  });
});

