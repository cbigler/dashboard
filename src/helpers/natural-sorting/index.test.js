import assert from 'assert';
import { ascending, descending } from './index';

describe('natural-sorting', function() {
  it('should sort numbers', function() {
    const numbers = [1, 4, 7, 3, 7, 5, 3, 2, 2, 9, 10, 11];
    assert.deepStrictEqual(
      numbers.sort(ascending),
      [1, 2, 2, 3, 3, 4, 5, 7, 7, 9, 10, 11],
    );
    assert.deepStrictEqual(
      numbers.sort(descending),
      [11, 10, 9, 7, 7, 5, 4, 3, 3, 2, 2, 1],
    );
  });
  it('should sort strings', function() {
    const strings = ['apples', 'oranges', 'onions', 'cucumbers', 'bananas', 'mushrooms'];
    assert.deepStrictEqual(
      strings.sort(ascending),
      ['apples', 'bananas', 'cucumbers', 'mushrooms', 'onions', 'oranges'],
    );
    assert.deepStrictEqual(
      strings.sort(descending),
      ['oranges', 'onions', 'mushrooms', 'cucumbers', 'bananas', 'apples'],
    );
  });
  it('should sort numbers so nulls / NaNs are always at the end', function() {
    assert.deepStrictEqual([2, null, 3, 1].sort(ascending), [1, 2, 3, null]);

    const nanResultsAscending = [NaN, 1, 2].sort(ascending);
    assert(isNaN(nanResultsAscending[nanResultsAscending.length-1]));

    assert.deepStrictEqual([2, null, 3, 1].sort(descending), [3, 2, 1, null]);

    const nanResultsDescending = [NaN, 1, 2].sort(descending);
    assert(isNaN(nanResultsDescending[nanResultsDescending.length-1]));
  });
  it('should sort strings with nulls so they are always at the end', function() {
    assert.deepStrictEqual(['foo', 'bar', '', null].sort(ascending), ['bar', 'foo', '', null]);
    assert.deepStrictEqual(['foo', 'bar', '', null].sort(descending), ['foo', 'bar', '', null]);
  });
});

