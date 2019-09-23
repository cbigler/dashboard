import { UPDATE_MODAL } from '../../actions/modal/update';

export default function updateModal(dispatch, data) {
  dispatch({ type: UPDATE_MODAL, data });
}
