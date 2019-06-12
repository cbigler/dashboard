import assert from 'assert';
import webhooks from './index';

import collectionWebhooksPush from '../../actions/collection/webhooks/push';
import collectionWebhooksSet from '../../actions/collection/webhooks/set';
import collectionWebhooksFilter from '../../actions/collection/webhooks/filter';
import collectionWebhooksDelete from '../../actions/collection/webhooks/delete';
import collectionWebhooksError from '../../actions/collection/webhooks/error';
import { COLLECTION_WEBHOOKS_DESTROY } from '../../actions/collection/webhooks/destroy';
import { COLLECTION_WEBHOOKS_UPDATE } from '../../actions/collection/webhooks/update';
import { COLLECTION_WEBHOOKS_CREATE } from '../../actions/collection/webhooks/create';

const WEBHOOK_ID_ONE = 'tok_3wxsa6e8dh5zdnf73ubpnaq37wz2nawcjw8hh5sfawb',
      WEBHOOK_ID_TWO = 'tok_aus86m8834xef4cqjeye2hzz3u8j5aafucxjgkn695h';

describe('webhooks', function() {
  it('should set webhooks when given a bunch of webhooks', function() {
    const initialState = webhooks(undefined, {});

    const result = webhooks(initialState, collectionWebhooksSet([
      {endpoint: 'https://example.com', id: WEBHOOK_ID_ONE},
      {endpoint: 'https://density.io', id: WEBHOOK_ID_TWO},
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {endpoint: 'https://example.com', id: WEBHOOK_ID_ONE},
        {endpoint: 'https://density.io', id: WEBHOOK_ID_TWO},
      ],
    });
  });
  it('should push webhook when given a webhook update', function() {
    const initialState = webhooks(undefined, {});

    // Add a new webhook.
    const webhookInCollection = webhooks(initialState, collectionWebhooksPush({
      id: WEBHOOK_ID_ONE,
      name: 'foo',
      endpoint: 'https://density.io',
    }));

    // Update webhook in collection
    const webhookUpdatedInCollection = webhooks(webhookInCollection, collectionWebhooksPush({
      id: WEBHOOK_ID_ONE,
      endpoint: 'https://example.com',
    }));

    assert.deepEqual(webhookUpdatedInCollection, {
      ...initialState,
      loading: false,
      data: [{id: WEBHOOK_ID_ONE, endpoint: 'https://example.com', name: 'foo'}],
    });
  });
  it('should push webhook when given a new webhook', function() {
    const initialState = webhooks(undefined, {});

    const result = webhooks(initialState, collectionWebhooksPush({
      id: 0,
      name: 'foo',
      endpoint: 'https://density.io',
    }));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [{id: 0, name: 'foo', endpoint: 'https://density.io'}],
    });
  });
  it('should add filters to the webhooks collection', function() {
    const initialState = webhooks(undefined, {});

    const result = webhooks(initialState, collectionWebhooksFilter('search', 'value'))

    assert.deepEqual(result, {
      ...initialState,
      filters: {search: 'value'},
    });
  });
  it('should delete a webhook from the webhook collection', function() {
    const initialState = webhooks(undefined, {});

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };

    // Add a webhook, then delete a webhook
    const webhookInCollection = webhooks(initialState, collectionWebhooksPush(WEBHOOK));
    const result = webhooks(webhookInCollection, collectionWebhooksDelete(WEBHOOK));

    // Initial state should then match final state.
    assert.deepEqual(result, {...initialState, loading: false});
  });
  it('should set an error when an error happens', function() {
    const initialState = webhooks(undefined, {});

    // Add a webhook, then delete a webhook
    const errorState = webhooks(initialState, collectionWebhooksError('boom!'));

    // Initial state should then match final state.
    assert.deepEqual(errorState, {
      ...initialState,
      loading: false,
      error: 'boom!',
    });
  });
});

// Write tests for each "operation" that can happen to a webhook, such ad creating, updating, and
// destroying.
describe('webhook operations', function() {
  it('should create a new webhook', function() {
    const initialState = webhooks(undefined, {});

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };

    // Start creating a webhook (ie, talking to server)
    let state = webhooks(initialState, {type: COLLECTION_WEBHOOKS_CREATE, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, {...initialState, loading: true});

    // When the server gets back, update the collection.
    state = webhooks(state, collectionWebhooksPush(WEBHOOK));

    // Ensure the item was added.
    assert.deepEqual(state, {
      ...initialState,
      loading: false,
      data: [{id: 'whk_1', name: 'foo', description: 'bar', endpoint: 'http://example.com'}],
    });
  });
  it('should destroy a webhook', function() {
    const initialState = webhooks(undefined, {});

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };
    let state = webhooks(initialState, collectionWebhooksSet([WEBHOOK]));

    // Start destroying a webhook
    state = webhooks(state, {type: COLLECTION_WEBHOOKS_DESTROY, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, {
      ...initialState,
      data: [{
        id: 'whk_1',
        name: 'foo',
        description: 'bar',
        endpoint: 'http://example.com',
      }],
      loading: true,
    });

    // When the server gets back, update the collection.
    state = webhooks(state, collectionWebhooksDelete(WEBHOOK));

    // Ensure the item was added.
    assert.deepEqual(state, {...initialState, loading: false, data: []});
  });
  it('should update a webhook', function() {
    const initialState = webhooks(undefined, {});

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };
    let state = webhooks(initialState, collectionWebhooksSet([WEBHOOK]));

    // Start destroying a webhook
    state = webhooks(state, {type: COLLECTION_WEBHOOKS_UPDATE, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, {
      ...initialState,
      data: [{id: 'whk_1', name: 'foo', description: 'bar', endpoint: 'http://example.com'}],
      loading: true,
    });

    // When the server gets back, update the collection.
    state = webhooks(state, collectionWebhooksPush({...WEBHOOK, name: 'bar'}));

    // Ensure the item was updated.
    assert.deepEqual(state, {
      ...initialState,
      loading: false,
      data: [
        {
          id: 'whk_1',
          name: 'bar',
          description: 'bar',
          endpoint: 'http://example.com',
        },
      ],
    });
  });
});
