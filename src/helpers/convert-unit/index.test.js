import assert from 'assert';
import convertUnit, {
  METERS,
  FEET,
  SQUARE_METERS,
  SQUARE_FEET,
  CENTIMETERS,
  INCHES,
} from './index';

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
  it('should correctly convert between inches and centimeters', function() {
    assert.equal(convertUnit(5, INCHES, CENTIMETERS), 12.7);
    assert.equal(convertUnit(5, CENTIMETERS, INCHES), 1.97);

    // Convert back and forth between units
    const converted = convertUnit(5.00, INCHES, CENTIMETERS);
    assert.equal(convertUnit(converted, CENTIMETERS, INCHES), 5.00);

    // 0 centimeters is also 0 inches
    assert.equal(convertUnit(0, CENTIMETERS, INCHES), 0);
  });
  it('should correctly convert between centimeters and meters', function() {
    assert.equal(convertUnit(500, CENTIMETERS, METERS), 5);
    assert.equal(convertUnit(5, METERS, CENTIMETERS), 500);

    // Convert back and forth between units
    const converted = convertUnit(5.00, METERS, CENTIMETERS);
    assert.equal(convertUnit(converted, CENTIMETERS, METERS), 5.00);

    // 0 centimeters is also 0 meters
    assert.equal(convertUnit(0, CENTIMETERS, METERS), 0);
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

