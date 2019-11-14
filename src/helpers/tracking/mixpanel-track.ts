import mixpanelInitialize from './mixpanel-initialize';

export default function mixpanelTrack(...args: Any<FixInRefactor>) {
  if (process.env.REACT_APP_MIXPANEL_TOKEN) {
    // Initialize mixpanel
    mixpanelInitialize();

    // Proxy through a call to `mixpanel.track`
    return window.mixpanel.track.apply(window.mixpanel, args);
  } else {
    // No mixpanel token, skip tracking analytics...
    return false;
  }
}
