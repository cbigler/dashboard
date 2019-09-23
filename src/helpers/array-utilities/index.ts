import * as d3Array from 'd3-array';

/**
 * Groups an array by key, where key is accessed from a property of the objects in the array
 * 
 * For example:
 * 
 *   const myList = [
 *     { kind: 'foo', value: 42 },
 *     { kind: 'bar', value: 37 },
 *     { kind: 'bar', value: 12 },
 *     { kind: 'foo', value: 92 },
 *   ]
 * 
 *   groupBy(myList, d => d.kind)
 * 
 * results in:
 * 
 *   [
 *      ['foo', [
 *        { kind: 'foo', value: 42 },
 *        { kind: 'foo', value: 92 },
 *      ]],
 *      ['bar', [
 *        { kind: 'bar', value: 37 },
 *        { kind: 'bar', value: 12 },
 *      ]]
 *   ]
 * 
 */
export function groupBy<T, K>(array: Iterable<T>, accessor: (datum: T, index: number, array: Iterable<T>) => K): [K, T[]][] {
  // @ts-ignore
  return d3Array.groups(array, accessor);
}

// helper to get values by group from the result of a `groupBy`
export function findGroup<T, K>(groupedData: [K, T[]][], group: K): T[] | undefined {
  const result = groupedData.find(([k, values]) => Object.is(group, k));
  if (!result) return undefined;
  return result[1];
}

export function arrayMax<T, V extends d3Array.Numeric>(array: Iterable<T>, accessor: (datum: T, index: number, array: Iterable<T>) => V): V | undefined {
  return d3Array.max(array, accessor);
}

export function arrayMin<T, V extends d3Array.Numeric>(array: Iterable<T>, accessor: (datum: T, index: number, array: Iterable<T>) => V): V | undefined {
  return d3Array.min(array, accessor);
}

export function findLeast<T>(array: Iterable<T>, accessor: (a: T) => d3Array.Numeric): T
export function findLeast<T>(array: Iterable<T>, comparator: (a: T, b: T) => d3Array.Numeric): T {
  // @ts-ignore
  return d3Array.least(array, comparator);
}
