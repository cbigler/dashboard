import assert from 'assert';
import activeModal from './index';

import storeFactory from '../../store';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

describe('active-modal', function() {
  it('shows a modal', function() {
    const store = storeFactory();
    store.dispatch(showModal('foo'));

    assert.equal(store.getState().activeModal.name, 'foo');
    assert.equal(store.getState().activeModal.visible, true);
  });
  it('shows a modal with data', function() {
    const store = storeFactory();
    store.dispatch(showModal('foo', {hello: 'world'}));

    assert.deepEqual(store.getState().activeModal, {
      name: 'foo',
      data: {hello: 'world'},
      visible: true,
    });
  });
  it('hides a modal', function() {
    const result = activeModal('foo', hideModal());
    assert.equal(result.name, null);
  });
});
