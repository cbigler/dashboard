import { TRANSITION_TO_HIDE_MODAL, HIDE_MODAL } from '../../actions/modal/hide';
import { RxReduxStore } from '../../rx-stores';

export default function hideModal(dispatch) {
  return new Promise(resolve => {
    // Set a flag on the modal so it can amimate out
    dispatch({ type: TRANSITION_TO_HIDE_MODAL });

    // Then after a bit, remove the modal completely (which should hopefully cause it to unmount)
    window.setTimeout(() => {
      // Only dispatch if the modal hasn't been re-opened during the interval
      if (RxReduxStore.imperativelyGetValue().activeModal.visible) {
        dispatch({ type: HIDE_MODAL });
      }
      resolve();
    }, 500);
  });
}
