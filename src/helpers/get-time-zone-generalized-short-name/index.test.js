import assert from 'assert';
import getTimeZoneGeneralizedShortName from './index';

describe('get-time-zone-generalized-short-name', function() {
  it('should work', function() {
    assert.equal(getTimeZoneGeneralizedShortName('America/New_York'), 'ET');
    assert.equal(getTimeZoneGeneralizedShortName('America/Chicago'), 'CT');
    assert.equal(getTimeZoneGeneralizedShortName('America/Denver'), 'MT');
    assert.equal(getTimeZoneGeneralizedShortName('America/Los_Angeles'), 'PT');
  });
});

