export const TRANSITION_TO_HIDE_MODAL = 'TRANSITION_TO_HIDE_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';

export default function hideModal(name = null) {
  return (dispatch, getState) => {
    // Set a flag on the modal so it can amimate out
    dispatch({ type: TRANSITION_TO_HIDE_MODAL });

    // Then after a bit, remove the modal completely (which should hopefully cause it to unmount)
    window.setTimeout(() => {
      // Only dispatch if the modal hasn't been re-opened during the interval
      if (!getState().activeModal.visible) {
        dispatch({ type: HIDE_MODAL, name });
      }
    }, 1000);
  };
}
