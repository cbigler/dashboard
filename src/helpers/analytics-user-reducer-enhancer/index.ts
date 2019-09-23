import mixpanelInitialize from '../mixpanel-initialize/index';
import setupHotjar from './hotjar';


function isUserImpersonating() {
  try {
    const impersonate = JSON.parse(window.localStorage.impersonate);
    return impersonate.enabled;
  } catch (err) {
    return false;
  }
}

export default function analyticsUserReducerEnhancer(reducer) {
  let previousState = null;
  return (state, props) => {
    const result = reducer(state, props);

    if (state !== previousState && !isUserImpersonating()) {
      // Not impersonating, so tracking is on

      previousState = state;

      if (process.env.REACT_APP_HOTJAR_SITE_ID) {
        setupHotjar(process.env.REACT_APP_HOTJAR_SITE_ID, 6);  
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
