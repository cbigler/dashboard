import assert from 'assert';
import spaceHierarchySearcher from './index';

import spaceHierarchyFormatter from '../space-hierarchy-formatter/index';
const hierarchy = spaceHierarchyFormatter([
  {
    name: 'Food',
    id: 0,
    spaceType: 'building',
    children: [
      {
        name: 'Pickled things',
        id: 1,
        spaceType: 'floor',
        children: [
          {name: 'Pickles', id: 2, spaceType: 'space'},
          {name: 'Sauerkraut', id: 3, spaceType: 'space'},
          {name: 'Relish', id: 4, spaceType: 'space'},
        ],
      },
      {
        name: 'Fruits',
        id: 5,
        spaceType: 'floor',
        children: [
          {
            name: 'Apples',
            id: 6,
            spaceType: 'space',
            children: [
              {name: 'Macintosh', id: 7, spaceType: 'space'},
              {name: 'Granny Smith', id: 8, spaceType: 'space'},
              {name: 'Gala', id: 9, spaceType: 'space'},
            ],
          },
          {name: 'Bananas', id: 10, spaceType: 'space'},
          {name: 'Peaches', id: 11, spaceType: 'space'},
        ],
      },
      {name: 'Calamari', id: 12, spaceType: 'floor'},
    ],
  },
]);

describe('space-hierarchy-searcher', function() {
  it('should search for "mac" and get the expected result', function() {
    const result = spaceHierarchySearcher(hierarchy, 'mac');

    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0].space.name, 'Food');
    assert.strictEqual(result[1].space.name, 'Fruits');
    assert.strictEqual(result[2].space.name, 'Apples');
    assert.strictEqual(result[3].space.name, 'Macintosh');
  });
  it('should search for "snuffluffigus" and get nothing', function() {
    const result = spaceHierarchySearcher(hierarchy, 'snuffluffigus');
    assert.strictEqual(result.length, 0);
  });
  it('should search for an empty string and get everything', function() {
    const result = spaceHierarchySearcher(hierarchy, '');
    assert.strictEqual(result.length, hierarchy.length);
  });
});

