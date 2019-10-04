import assert from 'assert';
import { webhooksReducer, initialState } from '.';

import collectionWebhooksPush from '../../rx-actions/collection/webhooks/push';
import collectionWebhooksSet from '../../rx-actions/collection/webhooks/set';
import collectionWebhooksFilter from '../../rx-actions/collection/webhooks/filter';
import collectionWebhooksDelete from '../../rx-actions/collection/webhooks/delete';
import collectionWebhooksError from '../../rx-actions/collection/webhooks/error';
import { COLLECTION_WEBHOOKS_DESTROY } from '../../rx-actions/collection/webhooks/destroy';
import { COLLECTION_WEBHOOKS_UPDATE } from '../../rx-actions/collection/webhooks/update';
import { COLLECTION_WEBHOOKS_CREATE } from '../../rx-actions/collection/webhooks/create';

const WEBHOOK_ID_ONE = 'tok_3wxsa6e8dh5zdnf73ubpnaq37wz2nawcjw8hh5sfawb',
      WEBHOOK_ID_TWO = 'tok_aus86m8834xef4cqjeye2hzz3u8j5aafucxjgkn695h';

describe('webhooks', () => {
  it('should set webhooks when given a bunch of webhooks', () => {

    const result = webhooksReducer(initialState, collectionWebhooksSet([
      {endpoint: 'https://example.com', id: WEBHOOK_ID_ONE},
      {endpoint: 'https://density.io', id: WEBHOOK_ID_TWO},
    ]));

    assert.deepEqual(result, Object.assign({}, initialState, {
      loading: false,
      data: [
        {endpoint: 'https://example.com', id: WEBHOOK_ID_ONE},
        {endpoint: 'https://density.io', id: WEBHOOK_ID_TWO},
      ],
    }));
  });
  it('should push webhook when given a webhook update', () => {

    // Add a new webhook.
    const webhookInCollection = webhooksReducer(initialState, collectionWebhooksPush({
      id: WEBHOOK_ID_ONE,
      name: 'foo',
      endpoint: 'https://density.io',
    }));

    // Update webhook in collection
    const webhookUpdatedInCollection = webhooksReducer(webhookInCollection, collectionWebhooksPush({
      id: WEBHOOK_ID_ONE,
      endpoint: 'https://example.com',
    }));

    assert.deepEqual(webhookUpdatedInCollection, Object.assign({}, initialState, {
      loading: false,
      data: [{id: WEBHOOK_ID_ONE, endpoint: 'https://example.com', name: 'foo'}],
    }));
  });
  it('should push webhook when given a new webhook', () => {

    const result = webhooksReducer(initialState, collectionWebhooksPush({
      id: 0,
      name: 'foo',
      endpoint: 'https://density.io',
    }));

    assert.deepEqual(result, Object.assign({}, initialState, {
      loading: false,
      data: [{id: 0, name: 'foo', endpoint: 'https://density.io'}],
    }));
  });
  it('should add filters to the webhooks collection', () => {

    const result = webhooksReducer(initialState, collectionWebhooksFilter('search', 'value'))

    assert.deepEqual(result, Object.assign({}, initialState, {
      filters: {search: 'value'},
    }));
  });
  it('should delete a webhook from the webhook collection', () => {

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };

    // Add a webhook, then delete a webhook
    const webhookInCollection = webhooksReducer(initialState, collectionWebhooksPush(WEBHOOK));
    const result = webhooksReducer(webhookInCollection, collectionWebhooksDelete(WEBHOOK));

    // Initial state should then match final state.
    assert.deepEqual(result, Object.assign({}, initialState, {loading: false}));
  });
  it('should set an error when an error happens', () => {

    // Add a webhook, then delete a webhook
    const errorState = webhooksReducer(initialState, collectionWebhooksError('boom!'));

    // Initial state should then match final state.
    assert.deepEqual(errorState, Object.assign({}, initialState, {
      loading: false,
      error: 'boom!',
    }));
  });
});

// Write tests for each "operation" that can happen to a webhook, such ad creating, updating, and
// destroying.
describe('webhook operations', () => {
  it('should create a new webhook', () => {

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };

    // Start creating a webhook (ie, talking to server)
    let state = webhooksReducer(initialState, {type: COLLECTION_WEBHOOKS_CREATE, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, Object.assign({}, initialState, {loading: true}));

    // When the server gets back, update the collection.
    state = webhooksReducer(state, collectionWebhooksPush(WEBHOOK));

    // Ensure the item was added.
    assert.deepEqual(state, Object.assign({}, initialState, {
      loading: false,
      data: [{id: 'whk_1', name: 'foo', description: 'bar', endpoint: 'http://example.com'}],
    }));
  });
  it('should destroy a webhook', () => {

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };
    let state = webhooksReducer(initialState, collectionWebhooksSet([WEBHOOK]));

    // Start destroying a webhook
    state = webhooksReducer(state, {type: COLLECTION_WEBHOOKS_DESTROY, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, Object.assign({}, initialState, {
      data: [{
        id: 'whk_1',
        name: 'foo',
        description: 'bar',
        endpoint: 'http://example.com',
      }],
      loading: true,
    }));

    // When the server gets back, update the collection.
    state = webhooksReducer(state, collectionWebhooksDelete(WEBHOOK));

    // Ensure the item was added.
    assert.deepEqual(state, Object.assign({}, initialState, {loading: false, data: []}));
  });
  it('should update a webhook', () => {

    const WEBHOOK = {
      id: 'whk_1',
      name: 'foo',
      description: 'bar',
      endpoint: 'http://example.com',
    };
    let state = webhooksReducer(initialState, collectionWebhooksSet([WEBHOOK]));

    // Start destroying a webhook
    state = webhooksReducer(state, {type: COLLECTION_WEBHOOKS_UPDATE, item: WEBHOOK});

    // Ensure that loading = true
    assert.deepEqual(state, Object.assign({}, initialState, {
      data: [{id: 'whk_1', name: 'foo', description: 'bar', endpoint: 'http://example.com'}],
      loading: true,
    }));

    // When the server gets back, update the collection.
    state = webhooksReducer(state, collectionWebhooksPush(Object.assign({}, WEBHOOK, {name: 'bar'})));

    // Ensure the item was updated.
    assert.deepEqual(state, Object.assign({}, initialState, {
      loading: false,
      data: [
        {
          id: 'whk_1',
          name: 'bar',
          description: 'bar',
          endpoint: 'http://example.com',
        },
      ],
    }));
  });
});
