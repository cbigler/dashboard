import assert from 'assert';
import formatCapacityPercentage from './index';

describe('format-capacity-percentage', function() {
  it('should work', function() {
    assert.equal(formatCapacityPercentage(1, 2), '50');
    assert.equal(formatCapacityPercentage(2, 3), '66.67');

    // With max decimal amount
    assert.equal(formatCapacityPercentage(1, 2, 10), '50');
    assert.equal(formatCapacityPercentage(2, 3, 10), '66.6666666667');

    // With no capacity
    assert.equal(formatCapacityPercentage(2, null), null);
  });
});

