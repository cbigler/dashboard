import assert from 'assert';
import tokens from './index';

import collectionTokensSet from '../../actions/collection/tokens/set';
import collectionTokensPush from '../../actions/collection/tokens/push';
import collectionTokensFilter from '../../actions/collection/tokens/filter';
import collectionTokensDelete from '../../actions/collection/tokens/delete';
import collectionTokensError from '../../actions/collection/tokens/error';
import { COLLECTION_TOKENS_DESTROY } from '../../actions/collection/tokens/destroy';
import { COLLECTION_TOKENS_UPDATE } from '../../actions/collection/tokens/update';
import { COLLECTION_TOKENS_CREATE } from '../../actions/collection/tokens/create';

// Don't worry - these tokens are bogus.
const TOKEN_ONE = 'tok_3wxsa6e8dh5zdnf73ubpnaq37wz2nawcjw8hh5sfawb';
const TOKEN_TWO = 'tok_aus86m8834xef4cqjeye2hzz3u8j5aafucxjgkn695h';

describe('token reducer actions', function() {
  it('should set tokens when given a bunch of tokens', function() {
    const initialState = tokens(undefined, {});

    const result = tokens(initialState, collectionTokensSet([
      {token_type: 'readonly', key: TOKEN_ONE},
      {token_type: 'readwrite', key: TOKEN_TWO},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {tokenType: 'readonly', key: TOKEN_ONE},
        {tokenType: 'readwrite', key: TOKEN_TWO},
      ],
    });
  });
  it('should push token when given a token update', function() {
    const initialState = tokens(undefined, {});

    // Add a new token.
    const tokenInCollection = tokens(initialState, collectionTokensPush({
      key: 0,
      name: 'foo',
      token_type: 'readonly',
    }));

    // Update token in collection
    const tokenUpdatedInCollection = tokens(tokenInCollection, collectionTokensPush({
      key: 0,
      name: 'new name',
    }));

    assert.deepEqual(tokenUpdatedInCollection, {
      ...initialState,
      loading: false,
      data: [{key: 0, name: 'new name', tokenType: 'readonly'}],
    });
  });
  it('should push token when given a new token', function() {
    const initialState = tokens(undefined, {});

    const result = tokens(initialState, collectionTokensPush({
      key: 0,
      name: 'foo',
      tokenType: 'readonly',
    }));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [{key: 0, name: 'foo', tokenType: 'readonly'}],
    });
  });
  it('should filter token collection when given a filter', function() {
    const initialState = tokens(undefined, {});

    const result = tokens(initialState, collectionTokensFilter('search', 'foo'));

    assert.deepEqual(result, {
      ...initialState,
      filters: {search: 'foo'},
    });
  });
  it('should delete a token from the tokens collection', function() {
    const initialState = tokens(undefined, {});

    const TOKEN = {
      key: 0,
      name: 'foo',
      token_type: 'readonly',
    };

    // Add a token, then delete a token
    const tokenInCollection = tokens(initialState, collectionTokensPush(TOKEN));
    const result = tokens(tokenInCollection, collectionTokensDelete(TOKEN));

    // Initial state should then match final state.
    assert.deepEqual(result, {...initialState, loading: false});
  });
  it('should set an error when an error happens', function() {
    const initialState = tokens(undefined, {});

    // Add a token, then delete a token
    const errorState = tokens(initialState, collectionTokensError('boom!'));

    // Initial state should then match final state.
    assert.deepEqual(errorState, {...initialState, error: 'boom!', loading: false});
  });
});

// Write tests for each "operation" that can happen to a token, such as creating, updating, and
// destroying.
describe('token operations', function() {
  it('should create a new token', function() {
    const initialState = tokens(undefined, {});

    const TOKEN = {
      key: 'tok_XXX',
      name: 'foo',
      token_type: 'readonly',
    };

    // Start creating a token (ie, talking to server)
    let state = tokens(initialState, {type: COLLECTION_TOKENS_CREATE, item: TOKEN});

    // Ensure that loading = true
    assert.deepEqual(state, {...initialState, loading: true});

    // When the server gets back, update the collection.
    state = tokens(state, collectionTokensPush(TOKEN));

    // Ensure the item was added.
    assert.deepEqual(state, {
      ...initialState,
      loading: false,
      data: [{key: 'tok_XXX', name: 'foo', tokenType: 'readonly'}],
    });
  });
  it('should destroy a token', function() {
    const initialState = tokens(undefined, {});

    const TOKEN = {
      key: 'tok_XXX',
      name: 'foo',
      token_type: 'readonly',
    };
    let state = tokens(initialState, collectionTokensSet([TOKEN]));

    // Start destroying a token
    state = tokens(state, {type: COLLECTION_TOKENS_DESTROY, item: TOKEN});

    // Ensure that loading = true
    assert.deepEqual(state, {
      ...initialState,
      data: [{
        key: 'tok_XXX',
        name: 'foo',
        tokenType: 'readonly',
      }],
      loading: true,
    });

    // When the server gets back, update the collection.
    state = tokens(state, collectionTokensDelete(TOKEN));

    // Ensure the item was added.
    assert.deepEqual(state, {...initialState, loading: false, data: []});
  });
  it('should update a token', function() {
    const initialState = tokens(undefined, {});

    const TOKEN = {
      key: 'tok_XXX',
      name: 'foo',
      token_type: 'readonly',
    };
    let state = tokens(initialState, collectionTokensSet([TOKEN]));

    // Start destroying a token
    state = tokens(state, {type: COLLECTION_TOKENS_UPDATE, item: TOKEN});

    // Ensure that loading = true
    assert.deepEqual(state, {
      ...initialState,
      data: [{
        key: 'tok_XXX',
        name: 'foo',
        tokenType: 'readonly',
      }],
      loading: true,
    });

    // When the server gets back, update the collection.
    state = tokens(state, collectionTokensPush({...TOKEN, name: 'bar'}));

    // Ensure the item was updated.
    assert.deepEqual(state, {...initialState, loading: false, data: [
      {
        key: 'tok_XXX',
        name: 'bar',
        tokenType: 'readonly',
      },
    ]});
  });
});
