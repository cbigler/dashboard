export const METERS = 'meters',
             FEET = 'feet',
             SQUARE_METERS = 'square_meters',
             SQUARE_FEET = 'square_feet';

const FEET_PER_METER = 3.281;
const SQUARE_FEET_PER_SQUARE_METER = 10.764;

export const UNIT_NAMES = {
  [FEET]: 'feet',
  [METERS]: 'meters',
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
