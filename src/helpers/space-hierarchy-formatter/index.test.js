import assert from 'assert';
import spaceHierarchyFormatter from './index';

describe('space-hierarchy-formatter', function() {
  it('should come up with a hierarchy with depths given the response from the hierarchy endpoint', function() {
    const hierarchy = [
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
    ];
    const items = spaceHierarchyFormatter(hierarchy);

    assert.equal(items[0].depth, 0);
    assert.equal(items[0].space.name, 'Food');
    assert.equal(items[0].children.length, 12);
    assert.equal(items[0].ancestry.length, 0);

    assert.equal(items[3].depth, 2);
    assert.equal(items[3].space.name, 'Sauerkraut');
    assert.equal(items[3].children.length, 0);
    assert.equal(items[3].ancestry.length, 2);
  });
});
