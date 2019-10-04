import ActiveModalStore from '../../rx-stores/active-modal';


export const TRANSITION_TO_HIDE_MODAL = 'TRANSITION_TO_HIDE_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export default function hideModal(dispatch: Any<FixInRefactor>) {
  return new Promise(resolve => {
    // Set a flag on the modal so it can amimate out
    dispatch({ type: TRANSITION_TO_HIDE_MODAL });

    // Then after a bit, remove the modal completely (which should hopefully cause it to unmount)
    window.setTimeout(() => {
      // Only dispatch if the modal hasn't been re-opened during the interval
      if (ActiveModalStore.imperativelyGetValue().visible) {
        dispatch({ type: HIDE_MODAL });
      }
      resolve();
    }, 500);
  });
}
