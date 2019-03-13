import { TRANSITION_TO_SHOW_TOAST, TOAST_SHOW, TRANSITION_TO_HIDE_TOAST, TOAST_HIDE} from '../../actions/toasts';

type ToastProps = {
  id: string,
  text: string,
  type?: string,
  visible: boolean,
};

const initialState: ToastProps[] = [];

export default function toasts(state=initialState, action) {
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
