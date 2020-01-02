// Mixpanel, fix your code.
if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  require('mixpanel-browser/mixpanel-jslib-snippet.js');
}

let initialized = false;

// Initialize mixpanel if it doesn't already exist.
export default function mixpanelInitialize() {
  if (process.env.REACT_APP_MIXPANEL_TOKEN && !initialized) {
    // FIXME: TS says "protocol" is not a valid config option for mixpanel init
    //        and it's probably right from peeking at the mixpanel source code.
    //        Leaving this here for now and typing with an Any<FixInRefactor>
    window.mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN, {protocol: 'https'} as Any<FixInRefactor>);
    initialized = true;
  }
}
