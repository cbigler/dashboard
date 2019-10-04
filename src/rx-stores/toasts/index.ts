import createRxStore from '..';
import { TRANSITION_TO_SHOW_TOAST, TOAST_SHOW, TRANSITION_TO_HIDE_TOAST, TOAST_HIDE } from '../../rx-actions/toasts';


// FIXME: why is this here? are these props for the toast component?
type ToastProps = {
  id: string,
  text: string,
  type?: string,
  visible: boolean,
};

export type ToastsState = ToastProps[];

const initialState: ToastsState = [];

// FIXME: action should be GlobalAction, but these action types need to be added
export function toastsReducer(state: ToastsState, action: Any<FixInRefactor>) {
  switch (action.type) {
  case TRANSITION_TO_SHOW_TOAST:
    return [...state, {...action.toast, visible: false}];
  case TOAST_SHOW:
    return state.map(toast => {
      if (toast.id === action.id) {
        return { ...toast, visible: true };
      } else {
        return toast;
      }
    });
  case TRANSITION_TO_HIDE_TOAST:
    return state.map(toast => {
      if (toast.id === action.id) {
        return { ...toast, visible: false };
      } else {
        return toast;
      }
    });
  case TOAST_HIDE:
    return state.filter(x => x.id !== action.id);
  default:
    return state;
  }
}

export default createRxStore('ToastStore', initialState, toastsReducer)
