export const TOAST_SHOW = 'TOAST_SHOW';
export const TOAST_HIDE = 'TOAST_HIDE';

export default function showToast({
  text,
  title = undefined as string | undefined,
  icon = undefined as any | undefined,
  type = undefined as string | undefined,
  timeout = 2000
}) {
  return dispatch => {
    const id = Math.random().toString();
    dispatch({ type: TOAST_SHOW, toast: { id, text, title, icon, type } });
    if (timeout) {
      setTimeout(() => dispatch({ type: TOAST_HIDE, id }), timeout);
    }
  };
}

export function hideToast(id) {
  return { type: TOAST_HIDE, id };
}
