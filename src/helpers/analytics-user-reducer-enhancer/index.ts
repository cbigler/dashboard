import mixpanelInitialize from '../mixpanel-initialize/index';
import { hotjar } from 'react-hotjar';


function isUserImpersonating() {
  try {
    const impersonate = JSON.parse(window.localStorage.impersonate);
    return impersonate.enabled;
  } catch (err) {
    return false;
  }
}

function setupHotjar(id, sv) {
  (function(h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function() {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: id, hjsv: sv };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
};

export default function analyticsUserReducerEnhancer(reducer) {
  return (state, props) => {
    const result = reducer(state, props);

    if (!isUserImpersonating()) {
      // Not impersonating, so tracking is on

      if (process.env.REACT_APP_HEAP_SITE_ID) {
        setupHotjar(process.env.REACT_APP_HEAP_SITE_ID, 6);  
      }

      if (result.data && process.env.REACT_APP_MIXPANEL_TOKEN) {
        // Initialize mixpanel
        mixpanelInitialize();

        // Update the user on mixpanel if the user info changed.
        // "Organization" is capitalized for consistency across multiple products
        // Database field names should always be underscores and lowercase
        (window as any).mixpanel.identify(result.data.id);
        (window as any).mixpanel.people.set({
           $name: result.data.fullName,
           $email: result.data.email,
           Organization: result.data.organization.name,
           organization_id: result.data.organization.id,
           is_admin: result.data.is_admin,
        });
      }
    }

    return result;
  };
}
