import assert from 'assert';
import formatPercentage from './index';

describe('format-percentage', function() {
  it('should work', function() {
    assert.equal(formatPercentage(1 / 2), '50');
    assert.equal(formatPercentage(2 / 3), '66.67');

    // With max decimal amount
    assert.equal(formatPercentage(1 / 2, 10), '50');
    assert.equal(formatPercentage(2 / 3, 10), '66.6666666667');
  });
});

