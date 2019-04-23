import assert from 'assert';
import convertUnit, { METERS, FEET, SQUARE_METERS, SQUARE_FEET } from './index';

describe('convert-unit', function() {
  it('should correctly convert between meters and feet', function() {
    assert.equal(convertUnit(5, FEET, METERS), 1.52);
    assert.equal(convertUnit(5, METERS, FEET), 16.41);

    // Convert back and forth between units
    const converted = convertUnit(5.00, METERS, FEET);
    assert.equal(convertUnit(converted, FEET, METERS), 5.00);

    // 0 meters is also 0 feet
    assert.equal(convertUnit(0, FEET, METERS), 0);
  });
  it('should correctly convert between square meters and square feet', function() {
    assert.equal(convertUnit(5, SQUARE_FEET, SQUARE_METERS), 0.46);
    assert.equal(convertUnit(5, SQUARE_METERS, SQUARE_FEET), 53.82);

    // Convert back and forth between units
    const converted = convertUnit(5.00, SQUARE_METERS, SQUARE_FEET);
    assert.equal(convertUnit(converted, SQUARE_FEET, SQUARE_METERS), 5.00);

    // 0 square meters is also 0 square feet
    assert.equal(convertUnit(0, SQUARE_FEET, SQUARE_METERS), 0);
  });
});

