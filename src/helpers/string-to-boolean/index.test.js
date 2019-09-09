import assert from 'assert';
import stringToBoolean from './index';

describe('string-to-boolean', function() {
  it('should return true for enabled values', function() {
    assert.equal(stringToBoolean('true'), true);
    assert.equal(stringToBoolean('True'), true);
    assert.equal(stringToBoolean('TRUE'), true);
    assert.equal(stringToBoolean('T'), true);
    assert.equal(stringToBoolean('t'), true);
    assert.equal(stringToBoolean(true), true);
  });
  it('should return false for disabled values', function() {
    assert.equal(stringToBoolean('false'), false);
    assert.equal(stringToBoolean('False'), false);
    assert.equal(stringToBoolean('FALSE'), false);
    assert.equal(stringToBoolean('F'), false);
    assert.equal(stringToBoolean('f'), false);
    assert.equal(stringToBoolean(false), false);
    assert.equal(stringToBoolean(undefined), false);
  });
});

