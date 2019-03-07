import * as React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import { Provider } from 'react-redux';
import storeFactory from '../../store';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import collectionWebhooksPush from '../../actions/collection/webhooks/push';
import collectionWebhooksSet from '../../actions/collection/webhooks/set';
import collectionWebhooksCreate from '../../actions/collection/webhooks/create';
import collectionWebhooksUpdate from '../../actions/collection/webhooks/update';
import collectionWebhooksFilter from '../../actions/collection/webhooks/filter';
import collectionWebhooksDestroy from '../../actions/collection/webhooks/destroy';

import ConnectedWebhookList, { WebhookList } from './index';

const WEBHOOK = {
  id: 'whk_1',
  name: 'foo!',
  description: 'bar baz',
  endpoint: 'http://example.com',
};

function timeout(delay) {
  return new Promise(r => setTimeout(r, delay));
}

describe('Webhook list page', function() {
  it('should render some webhooks (smoke test)', function() {
    const component = mount(<WebhookList
      activeModal={{name: null, data: {}}}
      webhooks={{
        data: [WEBHOOK],
        filters: {
          search: '',
        },
      }}
    />);

    // Should render one webhook
    assert.equal(component.find('.webhook-list-item').length, 1);
  });

  it('should create a new webhook', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([]));
    component.update()

    // Click on the new button
    component.find('.webhook-list-create-webhook-link').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-create');
    assert.equal(component.find('.webhook-create-columns').length, 1);

    // The button in the modal should be disabled by default.
    assert.equal(component.find('Button').prop('disabled'), true);

    // Add a webhook name and endpoint
    component.find('.webhook-create-name-container input').first().simulate('change', {target: {value: 'webhook name'}});
    component.find('.webhook-create-endpoint-container input').first().simulate('change', {target: {value: 'http://example.com'}});

    // The button in the modal should now be enabled.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Click the button in the modal, which should create a new webhook on the server.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.resolve({
        id: 'whk_1',
        name: 'webhook name',
        description: '',
        endpoint: 'http://example.com',
      }),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Ensure that the webhook was added.
    const newWebhook = store.getState().webhooks.data.find(i => i.name === 'webhook name');
    assert.notEqual(newWebhook, undefined);

    // The modal should no longer be visible.
    assert.equal(store.getState().activeModal.visible, false);
  });
  it('should display an error when creating a new webhook fails', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([]));
    component.update();

    // Click on the new button
    component.find('.webhook-list-create-webhook-link').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-create');
    assert.equal(component.find('.webhook-create-columns').length, 1);

    // The button in the modal should be disabled by default.
    assert.equal(component.find('Button').prop('disabled'), true);

    // Add a webhook name and endpoint
    component.find('.webhook-create-name-container input').first().simulate('change', {target: {value: 'webhook name'}});
    component.find('.webhook-create-endpoint-container input').first().simulate('change', {target: {value: 'http://example.com'}});

    // The button in the modal should now be enabled.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Click the button in the modal, which should create a new webhook on the server.
    global.fetch = sinon.stub().resolves({
      ok: false,
      status: 403,
      clone() { return this; },
      json: () => Promise.resolve({detail: 'Error!'}),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Verify that a webhook wasn't added, since an error happened.
    assert.equal(store.getState().webhooks.data.length, 0);
    assert.notEqual(store.getState().webhooks.error, null);
    assert.equal(store.getState().webhooks.loading, false);

    // The modal should still be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-create');
    assert.equal(component.find('.webhook-create-columns').length, 1);
  });
  it('should update a webhook', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([WEBHOOK]));
    component.update();

    // Click on the edit button
    component.find('.webhook-card-edit').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);

    // The button in the modal should be enabled, since the webhook was valid already.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Update name
    component.find('.webhook-update-name-container input').first().simulate('change', {target: {value: 'foo!'}});

    // The button in the modal should still be enabled.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Click the button in the modal, which should create a new webhook on the server.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 200,
      clone() { return this; },
      json: () => Promise.resolve({
        id: 'whk_1',
        name: 'foo!',
        description: '',
        endpoint: 'http://example.com',
      }),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Ensure that the webhook was updated.
    const newWebhook = store.getState().webhooks.data.find(i => i.name === 'foo!');
    assert.notEqual(newWebhook, undefined);

    // The modal should not be visible.
    assert.equal(store.getState().activeModal.visible, false);
  });
  it('should display an error when updating a webhook fails', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([WEBHOOK]));
    component.update();

    // Click on the edit button
    component.find('.webhook-card-edit').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);

    // The button in the modal should be enabled, since the webhook was valid already.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Update name
    component.find('.webhook-update-name-container input').first().simulate('change', {target: {value: 'foo!'}});

    // The button in the modal should still be enabled.
    assert.equal(component.find('Button').prop('disabled'), false);

    // Click the button in the modal, which should attempt to update the webhook.
    global.fetch = sinon.stub().resolves({
      ok: false,
      status: 403,
      clone() { return this; },
      json: () => Promise.resolve({detail: 'Error!'}),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Verify that a webhook wasn't updated, since an error happened.
    const newWebhook = store.getState().webhooks.data.find(i => i.name === 'foo!');
    assert.notEqual(newWebhook, undefined);
    assert.notEqual(store.getState().webhooks.error, null);
    assert.equal(store.getState().webhooks.loading, false);

    // The modal should still be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);
  });
  it('should destroy a webhook', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([WEBHOOK]));
    component.update();

    // Click on the edit button
    component.find('.webhook-card-edit').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);

    // Click the destroy link.
    component.find('.webhook-update-destroy-link').first().simulate('click');

    // Click the button in the modal, which should destroy the webhook.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 200,
      clone() { return this; },
      json: () => Promise.resolve({
        id: 'whk_1',
        name: 'foo!',
        description: '',
        endpoint: 'http://example.com',
      }),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Ensure that the webhook was deleted.
    assert.equal(store.getState().webhooks.data.length, 0);

    // The modal should not be visible.
    assert.equal(store.getState().activeModal.visible, false);
  });
  it('should display an error when destroying a webhook fails', async function() {
    // Mount the connected version of the component.
    const store = storeFactory();
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    store.dispatch(collectionWebhooksSet([WEBHOOK]));
    component.update();

    // Click on the edit button
    component.find('.webhook-card-edit').first().simulate('click');

    // The modal should be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);

    // Click the destroy link.
    component.find('.webhook-update-destroy-link').first().simulate('click');

    // Click the button in the modal, which should attempt to destroy the webhook.
    global.fetch = sinon.stub().resolves({
      ok: false,
      status: 403,
      clone() { return this; },
      json: () => Promise.resolve({detail: 'Error!'}),
    });
    component.find('Button').first().simulate('click');

    // Ensure that loading spinner is visible.
    assert.equal(store.getState().webhooks.loading, true);

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(50);

    // Verify that a webhook wasn't deleted, since an error happened.
    assert.equal(store.getState().webhooks.data.length, 1);
    assert.notEqual(store.getState().webhooks.error, null);
    assert.equal(store.getState().webhooks.loading, false);

    // The modal should still be visible.
    assert.equal(store.getState().activeModal.name, 'webhook-update');
    assert.equal(component.find('.webhook-update-modal').length, 1);
  });
  it('should filter the webhook page', async function() {
    // Mount the connected version of the component, with a token.
    const store = storeFactory();
    store.dispatch(collectionWebhooksSet([
      {
        id: 'whk_1',
        name: 'pineapple',
        description: 'bar baz',
        endpoint: 'http://123.com',
      },
      {
        id: 'whk_2',
        name: 'apple',
        description: 'bar baz',
        endpoint: 'http://456.com',
      },
      {
        id: 'whk_3',
        name: 'foo',
        description: 'bar baz',
        endpoint: 'http://789.com',
      },
    ]));
    const component = mount(<Provider store={store}><ConnectedWebhookList /></Provider>);
    component.update();

    // All three are visible.
    assert.equal(component.find('.webhook-list-item').length, 3);

    // Enter a search query to filter the tokens
    component.find('.webhook-list-search input').first().simulate('change', {target: {value: 'apple'}});

    // Only `apple` and `pineapple` show up
    assert.equal(component.find('.webhook-list-item').length, 2);
  });
});
