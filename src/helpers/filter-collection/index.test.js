import assert from 'assert';
import filterCollection from './index';

const collection = [
  {name: 'Ryan Gaus', position: 'developer', team: 'web mobile apps'},
  {name: 'Gus Cost', position: 'developer', team: 'web mobile apps'},
  {name: 'Ben Redfield', position: 'lead', team: 'web mobile apps'},
  {name: 'John Shanley', position: 'developer', team: 'algorithm'},
]

describe('filter-collection', function() {
  it('should filter a collection by name', function() {
    const nameFilter = filterCollection({fields: ['name']});
    const filtered = nameFilter(collection, 'Ryan');
    assert.deepEqual(filtered, [
      collection[0], // Ryan
    ]);
  });
  it('should filter and sort a collection by name', function() {
    const nameFilter = filterCollection({fields: ['name']});
    const filtered = nameFilter(collection, 'us');
    assert.deepEqual(filtered, [
      collection[0], // Ryan
      collection[1], // Gus
    ]);
  });
  it('should filter and sort a collection by team and position', function() {
    const nameFilter = filterCollection({fields: ['team', 'position']});
    const filtered = nameFilter(collection, 'web dev');
    assert.deepEqual(filtered, [
      collection[0], // Ryan (dev and web)
      collection[1], // Gus (dev and web)
    ]);
  });
  it('should return the colelction with an empty search string', function() {
    const nameFilter = filterCollection({fields: ['name']});
    const filtered = nameFilter(collection, '');
    assert.deepEqual(filtered, collection);
  });
});

