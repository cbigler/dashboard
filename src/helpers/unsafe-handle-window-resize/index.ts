import incrementResizeCounter from '../../actions/miscellaneous/increment-resize-counter';

export default function unsafeHandleWindowResize(store) {
  let resizeTimeout: any = false;
  function resizeDispatch() {
    store.dispatch(incrementResizeCounter());
  }
  function resizeHandler() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeDispatch, 300);
  }
  window.addEventListener('resize', resizeHandler);
  return resizeHandler;
}
