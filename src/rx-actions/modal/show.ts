import { TRANSITION_TO_SHOW_MODAL, SHOW_MODAL } from '../../actions/modal/show';

export default function showModal(dispatch, name, data={}) {
  // First, ensure the modal is rendered.
  dispatch({ type: TRANSITION_TO_SHOW_MODAL, name, data });

  // Then, show it, which allows it to animate in.
  dispatch({ type: SHOW_MODAL });
}
