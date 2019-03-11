import assert from 'assert';
import spaceHierarchyFormatter from './index';

describe('space-hierarchy-formatter', function() {
  it('should come up with a hierarchy given a list of spaces', function() {
    const spaces = [
      {name: 'Food', id: 0, parentId: null, spaceType: 'building'},
        {name: 'Pickled things', id: 1, parentId: 0, spaceType: 'floor'},
          {name: 'Pickles', id: 2, parentId: 1, spaceType: 'space'},
          {name: 'Sauerkraut', id: 3, parentId: 1, spaceType: 'space'},
          {name: 'Relish', id: 4, parentId: 1, spaceType: 'space'},
        {name: 'Fruits', id: 5, parentId: 0, spaceType: 'floor'},
          {name: 'Apples', id: 6, parentId: 5, spaceType: 'space'},
            {name: 'Macintosh', id: 7, parentId: 6, spaceType: 'space'},
            {name: 'Granny Smith', id: 8, parentId: 6, spaceType: 'space'},
            {name: 'Gala', id: 9, parentId: 6, spaceType: 'space'},
          {name: 'Bananas', id: 10, parentId: 5, spaceType: 'space'},
          {name: 'Peaches', id: 11, parentId: 5, spaceType: 'space'},
        {name: 'Calamari', id: 12, parentId: 0, spaceType: 'floor'},
    ];

    const items = spaceHierarchyFormatter(spaces);

    // Ensure the return value of `calculateItemRenderOrder` is what is expected
    assert.deepEqual(items, [
      {
        depth: 0,
        space: {
          id: 'zerocampuses',
          disabled: true,
          name: 'Campus',
          spaceType: 'campus',
        },
      },

      { depth: 0, space: { name: 'Food', spaceType: 'building', id: 0, parentId: null } },
      { depth: 1, space: { name: 'Pickled things', spaceType: 'floor', id: 1, parentId: 0 } },
      { depth: 2, space: { name: 'Pickles', spaceType: 'space', id: 2, parentId: 1 } },
      { depth: 2, space: { name: 'Sauerkraut', spaceType: 'space', id: 3, parentId: 1 } },
      { depth: 2, space: { name: 'Relish', id: 4, spaceType: 'space', parentId: 1 } },
      { depth: 1, space: { name: 'Fruits', id: 5, spaceType: 'floor', parentId: 0 } },
      { depth: 2, space: { name: 'Apples', id: 6, spaceType: 'space', parentId: 5 } },
      { depth: 3, space: { name: 'Macintosh', id: 7, spaceType: 'space', parentId: 6 } },
      { depth: 3, space: { name: 'Granny Smith', id: 8, spaceType: 'space', parentId: 6 } },
      { depth: 3, space: { name: 'Gala', id: 9, spaceType: 'space', parentId: 6 } },
      { depth: 2, space: { name: 'Bananas', id: 10, spaceType: 'space', parentId: 5 } },
      { depth: 2, space: { name: 'Peaches', id: 11, spaceType: 'space', parentId: 5 } },
      { depth: 1, space: { name: 'Calamari', id: 12, spaceType: 'floor', parentId: 0 } },
    ]);
  });
  it('should render the zero items when there are no campuses, buildings, or floors', function() {
    // Ensure the return value of `calculateItemRenderOrder` is what is expected
    const items = spaceHierarchyFormatter([]);
    assert.deepEqual(items, [
      {
        depth: 0,
        space: {
          id: 'zerocampuses',
          disabled: true,
          name: 'Campus',
          spaceType: 'campus',
        },
      },
      {
        depth: 0,
        space: {
          id: 'zerobuildings',
          disabled: true,
          name: 'Building',
          spaceType: 'building',
        },
      },
      {
        depth: 0,
        space: {
          id: 'zerofloors',
          disabled: true,
          name: 'Floor',
          spaceType: 'floor',
        },
      },
    ]);
  });
});
