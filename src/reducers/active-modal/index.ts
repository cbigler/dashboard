import { TRANSITION_TO_SHOW_MODAL, SHOW_MODAL } from '../../actions/modal/show';
import { TRANSITION_TO_HIDE_MODAL, HIDE_MODAL } from '../../actions/modal/hide';
import { UPDATE_MODAL } from '../../actions/modal/update';

const initialState = {name: null, data: {}};
export default function activeModal(state=initialState, action) {
  switch (action.type) {
  case TRANSITION_TO_SHOW_MODAL:
    return {
      name: action.name,
      data: action.data,
      visible: false,
    };
  case SHOW_MODAL:
    return { ...state, visible: true };
  case TRANSITION_TO_HIDE_MODAL:
    return { ...state, visible: false };
  case HIDE_MODAL:
    return {name: null, data: {}, visible: false};
  case UPDATE_MODAL:
    return {...state, data: {...state.data, ...action.data}};
  default:
    return state;
  }
}
