import { TOAST_SHOW, TOAST_HIDE} from '../../actions/toasts';

type ToastProps = {
  id: string,
  text: string,
  title?: string,
  icon?: any,
  type?: string
}

const initialState: ToastProps[] = [];

export default function toasts(state=initialState, action) {
  switch (action.type) {
  case TOAST_SHOW:
    return [...state, action.toast];
  case TOAST_HIDE:
    return state.filter(x => x.id !== action.id);
  default:
    return state;
  }
}
