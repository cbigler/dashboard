import mixpanelInitialize from '../../helpers/tracking/mixpanel-initialize';
import setupHotjar from '../../helpers/tracking/hotjar';

import { UserState } from '.';
import { StoreSubject } from '..';

import { ON_PREM } from '../../fields';

function isUserImpersonating() {
  try {
    const impersonate = JSON.parse(window.localStorage.impersonate);
    return impersonate.enabled;
  } catch (err) {
    return false;
  }
}

// trying out this pattern for dependency injection
export default function registerSideEffects(
  userStore: StoreSubject<UserState>,
) {

  // NOTE: USER_SET not yet added to GlobalAction types, hence the Any<FixInRefactor>
  userStore.subscribe((userState: UserState) => {

    // Skip tracking if user is impersonating
    if (isUserImpersonating()) { return; }
    // Also skip tracking if this is an on-prem build
    if (ON_PREM) { return; }

    if (process.env.REACT_APP_HOTJAR_SITE_ID && !ON_PREM) {
      setupHotjar(process.env.REACT_APP_HOTJAR_SITE_ID, 6);
    }

    if (userState.data && process.env.REACT_APP_MIXPANEL_TOKEN) {

      const user = userState.data;

      // Initialize mixpanel
      mixpanelInitialize();

      // Update the user on mixpanel if the user info changed.
      // "Organization" is capitalized for consistency across multiple products
      // Database field names should always be underscores and lowercase
      window.mixpanel.identify(user.id);
      window.mixpanel.people.set({
        $name: user.full_name,
        $email: user.email,
        Organization: user.organization.name,
        organization_id: user.organization.id,
        is_admin: undefined,
        // FIXME: this used to be the below, but that property doesn't exist.
        //        so for now, explicitly passing undefined
        // is_admin: user.is_admin,
      });
    }
  });
}
