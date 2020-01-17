import assert from 'assert';
import { initialState, spacesReducer } from '.';

import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpacesPush from '../../rx-actions/collection/spaces-legacy/push';
import collectionSpacesFilter from '../../rx-actions/collection/spaces-legacy/filter';
import collectionSpacesDelete from '../../rx-actions/collection/spaces-legacy/delete';
import collectionSpacesError from '../../rx-actions/collection/spaces-legacy/error';
import { COLLECTION_SPACES_UPDATE } from '../../rx-actions/collection/spaces-legacy/update'; 

describe('spaces', function() {
  it('should set spaces when given a bunch of spaces', function() {
    const result = spacesReducer(initialState, collectionSpacesSet([
      {id: 0, name: 'foo', current_count: 5},
      {id: 1, name: 'bar', current_count: 8},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      view: 'VISIBLE',
      loading: false,
      data: [
        {id: 0, name: 'foo', current_count: 5},
        {id: 1, name: 'bar', current_count: 8},
      ],
    });
  });
  it('should push space when given a space update', function() {
    // Add a new space.
    const spaceInCollection = spacesReducer(initialState, collectionSpacesPush({
      id: 0,
      name: 'foo',
      current_count: 4,
    }));

    // Update space in collection
    const spaceUpdatedInCollection = spacesReducer(spaceInCollection, collectionSpacesPush({
      id: 0,
      name: 'new name',
    }));

    assert.deepEqual(spaceUpdatedInCollection, {
      ...initialState,
      view: 'VISIBLE',
      loading: false,
      data: [{id: 0, name: 'new name', current_count: 4}],
    });
  });
  it('should push space when given a new space', function() {
    const result = spacesReducer(initialState, collectionSpacesPush({
      id: 0,
      name: 'foo',
      current_count: 5,
    }));

    assert.deepEqual(result, {
      ...initialState,
      view: 'VISIBLE',
      loading: false,
      data: [{id: 0, name: 'foo', current_count: 5}],
    });
  });
  it('should filter space collection when given a filter', function() {
    const result = spacesReducer(initialState, collectionSpacesFilter('search', 'foo'));

    assert.deepEqual(result, {
      ...initialState,
      filters: {...initialState.filters, search: 'foo'},
    });
  });
  it('should delete a space from the spaces collection', function() {
    const SPACE = {
      id: 0,
      name: 'foo',
      current_count: 5,
    };

    // Add a space, then delete a space
    const spaceInCollection = spacesReducer(initialState, collectionSpacesPush(SPACE));
    const result = spacesReducer(spaceInCollection, collectionSpacesDelete(SPACE));

    // Initial state should then match final state.
    assert.deepEqual(result, {...initialState, view: 'VISIBLE', loading: false});
  });
  it('should set an error when an error happens', function() {
    // Add a space, then delete a space
    const errorState = spacesReducer(initialState, collectionSpacesError('boom!'));

    // Initial state should then match final state.
    assert.deepEqual(errorState, {...initialState, error: 'boom!', view: 'ERROR', loading: false});
  });
  it('should clear an error and start loading when an async operation starts.', function() {
    // Add an error to the state.
    const errorState = spacesReducer(initialState, collectionSpacesError('boom!'));

    // Then, update a space.
    const state = spacesReducer(errorState, {type: COLLECTION_SPACES_UPDATE});

    // Initial state should then have error: null
    assert.deepEqual(state, {...initialState, error: null, loading: true});
  });
  it('should clear the parent space filter on set if the parent space was deleted', function() {
    // Set two spaces
    const resulta = spacesReducer(initialState, collectionSpacesSet([
      {id: 0, name: 'foo', current_count: 5},
      {id: 1, name: 'bar', current_count: 8},
    ]));

    // Set the selected parent space equal to one of those spaces
    initialState.filters.parent = 1;

    // Set one space
    const resultb = spacesReducer(resulta, collectionSpacesSet([
      {id: 0, name: 'foo', current_count: 5},
    ]));

    // Ensure that the parent filter has been cleared, since the space that was in there no longer
    // exists.
    assert.equal(resultb.filters.parent, null);
  });
});
