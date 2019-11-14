import { TRANSITION_TO_SHOW_MODAL, SHOW_MODAL } from '../../rx-actions/modal/show';
import { TRANSITION_TO_HIDE_MODAL, HIDE_MODAL } from '../../rx-actions/modal/hide';
import { UPDATE_MODAL } from '../../rx-actions/modal/update';
import createRxStore from '..';


export type ActiveModalState = {
  name: string | null,
  data: Any<FixInRefactor>,
  visible: boolean,
}

const initialState: ActiveModalState = {
  name: null,
  data: {},
  visible: false,
};

// FIXME: action should be GlobalAction, add these action types
export function activeModalReducer(state: ActiveModalState, action: Any<FixInRefactor>) {
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

const ActiveModalStore = createRxStore('ActiveModalStore', initialState, activeModalReducer)

export default ActiveModalStore;
