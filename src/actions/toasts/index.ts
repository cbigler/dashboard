import uuid from 'uuid';

export const TRANSITION_TO_SHOW_TOAST = 'TRANSITION_TO_SHOW_TOAST';
export const TOAST_SHOW = 'TOAST_SHOW';
export const TRANSITION_TO_HIDE_TOAST = 'TRANSITION_TO_HIDE_TOAST';
export const TOAST_HIDE = 'TOAST_HIDE';

export default function showToast({
  text,
  id = undefined as string | undefined,
  title = undefined as string | undefined,
  icon = undefined as any | undefined,
  type = undefined as string | undefined,
  timeout = 2000 as (number | null),
}) {
  return dispatch => {
    id = id || uuid();
    dispatch({
      type: TRANSITION_TO_SHOW_TOAST,
      toast: { id, text, title, icon, type },
    });
    dispatch({ type: TOAST_SHOW, id });
    if (timeout) {
      setTimeout(() => dispatch(hideToast(id)), timeout);
    }
  };
}

export function hideToast(id) {
  return dispatch => {
    return new Promise(resolve => {
      dispatch({ type: TRANSITION_TO_HIDE_TOAST, id });
      setTimeout(() => {
        dispatch({ type: TOAST_HIDE, id });
        resolve();
      }, 500);
    });
  }
}
