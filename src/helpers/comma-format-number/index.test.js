import assert from 'assert';
import commaFormatNumber, { cache } from './index';

describe('comma-format-number', function() {
  it('should work', function() {
    assert.equal(commaFormatNumber(10), '10');
    assert.equal(commaFormatNumber(999), '999');
    assert.equal(commaFormatNumber(1000), '1,000');
    assert.equal(commaFormatNumber(123456), '123,456');
    assert.equal(commaFormatNumber(1234567), '1,234,567');

    // Verify cache works
    assert.equal(commaFormatNumber(1001), '1,001');
    assert.equal(cache['1001;,;3'], '1,001');
  });
});

