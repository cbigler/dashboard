import assert from 'assert';
import analyticsColorScale from './index';

describe('analytics-color-scale', function() {
  it('should work', function() {
    assert.equal(analyticsColorScale(), '#ff0000');
  });
});

