import hideModal from './hide';

export const TRANSITION_TO_SHOW_MODAL = 'TRANSITION_TO_SHOW_MODAL';
export const SHOW_MODAL = 'SHOW_MODAL';

export default function showModal(name, data={}) {
  return async (dispatch, getState) => {
    // A modal is already visible, animate it out before showing the current modal
    if (getState().activeModal.name) {
      await dispatch(hideModal());
    }

    // First, ensure the modal is rendered.
    dispatch({ type: TRANSITION_TO_SHOW_MODAL, name, data });

    // Then, show it, which allows it to animate in.
    dispatch({ type: SHOW_MODAL });
  };
}
