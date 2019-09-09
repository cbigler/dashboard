export default function unsafeHandleWindowResize(callback, delay = 300) {
  let resizeTimeout: any = false;
  function resizeHandler() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(callback, delay);
  }
  window.addEventListener('resize', resizeHandler);
  return resizeHandler;
}
