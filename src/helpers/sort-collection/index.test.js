
import assert from 'assert';
import sortCollection, { SORT_NEWEST, SORT_A_Z } from './index';

describe('sort-collection', function() {
  it('works sorting from a-z', function() {
    assert.deepEqual(
      sortCollection([{name: 'b'}, {name: 'a'}], SORT_A_Z),
      [{name: 'a'}, {name: 'b'}]
    );
  });
  it('works sorting from newest to oldest', function() {
    assert.deepEqual(
      sortCollection([{createdAt: 10}, {createdAt: 5}], SORT_NEWEST),
      [{createdAt: 10}, {createdAt: 5}]
    );
  });
});

