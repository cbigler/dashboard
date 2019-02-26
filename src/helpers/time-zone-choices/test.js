import assert from 'assert';
import TIMEZONE_CHOICES, { startTimezones } from './index';

describe('time-zone-choices', function() {
  it('should start with a value in startTimezones', function() {
    assert(startTimezones.includes(TIMEZONE_CHOICES[0]));
  });
});

