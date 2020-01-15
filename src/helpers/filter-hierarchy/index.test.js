import assert from 'assert';
import { getParentsOfSpace } from './index';

describe('filter-hierarchy', function() {
  describe('getParentsOfSpace', function() {
    const hierarchy = [
      {name: 'Food', id: 0, parent_id: null},
        {name: 'Pickled things', id: 1, parent_id: 0},
          {name: 'Pickles', id: 2, parent_id: 1},
          {name: 'Sour crout', id: 3, parent_id: 1},
          {name: 'Relish', id: 4, parent_id: 1},
        {name: 'Fruits', id: 5, parent_id: 0},
          {name: 'Apples', id: 6, parent_id: 5},
            {name: 'Macintosh', id: 7, parent_id: 6},
            {name: 'Granny Smith', id: 8, parent_id: 6},
            {name: 'Gala', id: 9, parent_id: 6},
          {name: 'Banannas', id: 10, parent_id: 5},
          {name: 'Peaches', id: 11, parent_id: 999999999}, /* has an invalid parent node! */
        {name: 'Calamari', id: 12, parent_id: 0},
    ];

    it('should get all parents of a space in a tree', function() {
      const grannySmith = hierarchy.find(i => i.name === 'Granny Smith');
      assert.deepEqual(
        getParentsOfSpace(hierarchy, grannySmith),
        [8, 6, 5, 0], /* Granny Smith, Apples, Fruits, Food */
      );
    });
    it('should throw an error if a node in the tree cannot be found', function() {
      const peaches = hierarchy.find(i => i.name === 'Peaches');
      expect(() => {
        getParentsOfSpace(hierarchy, peaches);
      }).toThrowError('No such space found with id 999999999');
    });
    it('should only return the root node when given the root node', function() {
      const food = hierarchy.find(i => i.name === 'Food');
      assert.deepEqual(
        getParentsOfSpace(hierarchy, food),
        [0], /* Food */
      );
    });
    it('should throw an error if an invalid space is passed to the function', function() {
      expect(() => {
        getParentsOfSpace(hierarchy, null);
      }).toThrowError('Invalid space passed to getParentsOfSpace')
    });
    it('should not infinitely loop if given bad data', function() {
      assert.deepEqual(
        getParentsOfSpace([{id: 0, /* no parent_id! */}], {id: 0}),
        [0],
      );

      assert.deepEqual(
        getParentsOfSpace([], {id: 0}),
        [0],
      );
    });
    it('should not infinitely loop if given cyclical data', function() {
      assert.throws(() => {
        getParentsOfSpace([
          {id: 0, parent_id: 1}, /* 0 => 1 => 0 => 1 => ... */
          {id: 1, parent_id: 0},
        ], {id: 0, parent_id: 1});
      }, /Cyclical space hierarchy detected! This isn't allowed./);
    });
  });
});
