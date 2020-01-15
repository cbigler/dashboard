import assert from 'assert';
import spaceHierarchyFormatter from './index';

describe('space-hierarchy-formatter-deprecated', function() {
  it('should come up with a hierarchy given a list of spaces', function() {
    const spaces = [
      {name: 'Food', id: 0, parent_id: null, space_type: 'building'},
        {name: 'Pickled things', id: 1, parent_id: 0, space_type: 'floor'},
          {name: 'Pickles', id: 2, parent_id: 1, space_type: 'space'},
          {name: 'Sauerkraut', id: 3, parent_id: 1, space_type: 'space'},
          {name: 'Relish', id: 4, parent_id: 1, space_type: 'space'},
        {name: 'Fruits', id: 5, parent_id: 0, space_type: 'floor'},
          {name: 'Apples', id: 6, parent_id: 5, space_type: 'space'},
            {name: 'Macintosh', id: 7, parent_id: 6, space_type: 'space'},
            {name: 'Granny Smith', id: 8, parent_id: 6, space_type: 'space'},
            {name: 'Gala', id: 9, parent_id: 6, space_type: 'space'},
          {name: 'Bananas', id: 10, parent_id: 5, space_type: 'space'},
          {name: 'Peaches', id: 11, parent_id: 5, space_type: 'space'},
        {name: 'Calamari', id: 12, parent_id: 0, space_type: 'floor'},
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
          space_type: 'campus',
        },
      },

      { depth: 0, space: { name: 'Food', space_type: 'building', id: 0, parent_id: null } },
      { depth: 1, space: { name: 'Pickled things', space_type: 'floor', id: 1, parent_id: 0 } },
      { depth: 2, space: { name: 'Pickles', space_type: 'space', id: 2, parent_id: 1 } },
      { depth: 2, space: { name: 'Sauerkraut', space_type: 'space', id: 3, parent_id: 1 } },
      { depth: 2, space: { name: 'Relish', id: 4, space_type: 'space', parent_id: 1 } },
      { depth: 1, space: { name: 'Fruits', id: 5, space_type: 'floor', parent_id: 0 } },
      { depth: 2, space: { name: 'Apples', id: 6, space_type: 'space', parent_id: 5 } },
      { depth: 3, space: { name: 'Macintosh', id: 7, space_type: 'space', parent_id: 6 } },
      { depth: 3, space: { name: 'Granny Smith', id: 8, space_type: 'space', parent_id: 6 } },
      { depth: 3, space: { name: 'Gala', id: 9, space_type: 'space', parent_id: 6 } },
      { depth: 2, space: { name: 'Bananas', id: 10, space_type: 'space', parent_id: 5 } },
      { depth: 2, space: { name: 'Peaches', id: 11, space_type: 'space', parent_id: 5 } },
      { depth: 1, space: { name: 'Calamari', id: 12, space_type: 'floor', parent_id: 0 } },
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
          space_type: 'campus',
        },
      },
      {
        depth: 0,
        space: {
          id: 'zerobuildings',
          disabled: true,
          name: 'Building',
          space_type: 'building',
        },
      },
      {
        depth: 0,
        space: {
          id: 'zerofloors',
          disabled: true,
          name: 'Floor',
          space_type: 'floor',
        },
      },
    ]);
  });
});
