// FIXME: uncomment when redux is gone
import 'moment';
describe('noop', function() {
  it('should go away', function() {
    expect(true).toBe(true);
  });
});
// import assert from 'assert';
// import activeModal from './index';

// import storeFactory from '../../store';

// import showModal from '../../rx-actions/modal/show';
// import hideModal from '../../rx-actions/modal/hide';

// describe('active-modal', function() {
//   it('shows a modal', function() {
//     const store = storeFactory();
//     showModal(store.dispatch, 'foo');

//     assert.equal(store.getState().activeModal.name, 'foo');
//     assert.equal(store.getState().activeModal.visible, true);
//   });
//   it('shows a modal with data', function() {
//     const store = storeFactory();
//     showModal(store.dispatch, 'foo', {hello: 'world'});

//     assert.deepEqual(store.getState().activeModal, {
//       name: 'foo',
//       data: {hello: 'world'},
//       visible: true,
//     });
//   });
//   it('hides a modal', function() {
//     const result = activeModal('foo', hideModal());
//     assert.equal(result.name, null);
//   });
// });
