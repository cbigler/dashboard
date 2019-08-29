type SortablePrimative = any;

const isMissing = (value: SortablePrimative) => {
  // null or undefined
  if (value == null) {
    return true;
  }
  // empty string
  if (value === '') {
    return true;
  }
  // NaN
  if (typeof value === 'number' && isNaN(value)) {
    return true;
  }
  return false;
}

// Both of these functions sort missing values last, then apply natural sort order to remaining values
export function ascending(a: SortablePrimative, b: SortablePrimative) {
  if (isMissing(b)) {
    return isMissing(a) ? 0 : -1;
  }
  if (isMissing(a)) {
    return 1;
  }
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else if (a >= b) {
    return 0;
  } else {
    return NaN;
  }
}

export function descending(a: SortablePrimative, b: SortablePrimative) {
  if (isMissing(b)) {
    return isMissing(a) ? 0 : -1;
  }
  if (isMissing(a)) {
    return 1;
  }
  if (b < a) {
    return -1;
  } else if (b > a) {
    return 1;
  } else if (b >= a) {
    return 0;
  } else {
    return NaN;
  }
}
