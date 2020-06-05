import assert from 'assert';
import { initialState, spacesLegacyReducer } from '.';

import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpacesPush from '../../rx-actions/collection/spaces-legacy/push';
import collectionSpacesFilter from '../../rx-actions/collection/spaces-legacy/filter';
import collectionSpacesDelete from '../../rx-actions/collection/spaces-legacy/delete';
import collectionSpacesError from '../../rx-actions/collection/spaces-legacy/error';
import { COLLECTION_SPACES_UPDATE } from '../../rx-actions/collection/spaces-legacy/update'; 
import { createSpace } from '../../helpers/test-utilities/objects/space';

describe('spaces', function() {
  it('should set spaces when given a bunch of spaces', function() {
    const result = spacesLegacyReducer(initialState, collectionSpacesSet([
      createSpace({id: '0', name: 'foo', current_count: 5}),
      createSpace({id: '1', name: 'bar', current_count: 8}),
    ]));

    expect(result.view).toEqual('VISIBLE')
    expect(result.loading).toEqual(false)
    expect(result.data.length).toEqual(2)
    expect(result.data[0]).toMatchObject({id: '0', name: 'foo', current_count: 5})
    expect(result.data[1]).toMatchObject({id: '1', name: 'bar', current_count: 8})
  });
  it('should push space when given a space update', function() {
    // Add a new space.
    const newSpace = createSpace({
      id: '0',
      name: 'foo',
      current_count: 4,
    })
    const spaceInCollection = spacesLegacyReducer(initialState, collectionSpacesPush(newSpace));

    // Update space in collection
    const spaceUpdatedInCollection = spacesLegacyReducer(spaceInCollection, collectionSpacesPush({
      id: '0',
      name: 'new name',
    }));

    expect(spaceUpdatedInCollection.view).toEqual('VISIBLE')
    expect(spaceUpdatedInCollection.loading).toEqual(false)
    expect(spaceUpdatedInCollection.data.length).toEqual(1)
    expect(spaceUpdatedInCollection.data[0]).toMatchObject({id: '0', name: 'new name', current_count: 4})
  });
  it('should push space when given a new space', function() {
    const result = spacesLegacyReducer(initialState, collectionSpacesPush({
      id: '0',
      name: 'foo',
      current_count: 5,
    }));

    assert.deepEqual(result, {
      ...initialState,
      view: 'VISIBLE',
      loading: false,
      data: [{id: '0', name: 'foo', current_count: 5}],
    });
  });
  it('should filter space collection when given a filter', function() {
    const result = spacesLegacyReducer(initialState, collectionSpacesFilter('search', 'foo'));

    assert.deepEqual(result, {
      ...initialState,
      filters: {...initialState.filters, search: 'foo'},
    });
  });
  it('should delete a space from the spaces collection', function() {
    const SPACE = createSpace({
      id: '0',
      name: 'foo',
      current_count: 5,
    });

    // Add a space, then delete a space
    const spaceInCollection = spacesLegacyReducer(initialState, collectionSpacesPush(SPACE));
    const result = spacesLegacyReducer(spaceInCollection, collectionSpacesDelete(SPACE));

    // Initial state should then match final state.
    assert.deepEqual(result, {...initialState, view: 'VISIBLE', loading: false});
  });
  it('should set an error when an error happens', function() {
    // Add a space, then delete a space
    const errorState = spacesLegacyReducer(initialState, collectionSpacesError('boom!'));

    // Initial state should then match final state.
    assert.deepEqual(errorState, {...initialState, error: 'boom!', view: 'ERROR', loading: false});
  });
  it('should clear an error and start loading when an async operation starts.', function() {
    // Add an error to the state.
    const errorState = spacesLegacyReducer(initialState, collectionSpacesError('boom!'));

    // Then, update a space.
    const state = spacesLegacyReducer(errorState, {type: COLLECTION_SPACES_UPDATE});

    // Initial state should then have error: null
    expect(state.error).toEqual(null)
  });
  it('should clear the parent space filter on set if the parent space was deleted', function() {
    // Set two spaces
    const resulta = spacesLegacyReducer(initialState, collectionSpacesSet([
      createSpace({id: '0', name: 'foo', current_count: 5}),
      createSpace({id: '1', name: 'bar', current_count: 8}),
    ]));

    // Set the selected parent space equal to one of those spaces
    initialState.filters.parent = '1';

    // Set one space
    const resultb = spacesLegacyReducer(resulta, collectionSpacesSet([
      createSpace({id: '0', name: 'foo', current_count: 5}),
    ]));

    // Ensure that the parent filter has been cleared, since the space that was in there no longer
    // exists.
    assert.equal(resultb.filters.parent, null);
  });
});
