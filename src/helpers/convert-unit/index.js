export const METERS = 'meters',
             CENTIMETERS = 'centimeters',
             FEET = 'feet',
             INCHES = 'inches',
             SQUARE_METERS = 'square_meters',
             SQUARE_FEET = 'square_feet';

const FEET_PER_METER = 3.281;
const SQUARE_FEET_PER_SQUARE_METER = 10.764;
const CENTIMETERS_PER_INCH = 2.54;

export const UNIT_NAMES = {
  [FEET]: 'feet',
  [METERS]: 'meters',
  [CENTIMETERS]: 'centimeters',
  [SQUARE_FEET]: 'sq. ft',
  [SQUARE_METERS]: 'sq. m',
};

export default function convertUnit(magnitude, fromUnit, toUnit, opts={round: 2}) {
  let result;
  // Converting between the same units always produces the same result
  if (fromUnit === toUnit) {
    return magnitude;

  // One-dimensional units
  } else if (fromUnit === FEET && toUnit === METERS) {
    result = magnitude / FEET_PER_METER;
  } else if (fromUnit === METERS && toUnit === FEET) {
    result = magnitude * FEET_PER_METER;

  } else if (fromUnit === CENTIMETERS && toUnit === INCHES) {
    result = magnitude / CENTIMETERS_PER_INCH;
  } else if (fromUnit === INCHES && toUnit === CENTIMETERS) {
    result = magnitude * CENTIMETERS_PER_INCH;

  } else if (fromUnit === CENTIMETERS && toUnit === METERS) {
    result = magnitude / 100;
  } else if (fromUnit === METERS && toUnit === CENTIMETERS) {
    result = magnitude * 100;

  // Square units
  } else if (fromUnit === SQUARE_FEET && toUnit === SQUARE_METERS) {
    result = magnitude / SQUARE_FEET_PER_SQUARE_METER;
  } else if (fromUnit === SQUARE_METERS && toUnit === SQUARE_FEET) {
    result = magnitude * SQUARE_FEET_PER_SQUARE_METER;

  } else {
    throw new Error(`Cannot convert ${magnitude} ${fromUnit} into ${toUnit}`);
  }

  // Optionally round the number
  if (opts.round) {
    const factor = Math.pow(10, opts.round);
    return Math.round(result * factor) / factor;
  } else {
    return result;
  }
}
