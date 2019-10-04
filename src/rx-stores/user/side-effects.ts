import mixpanelInitialize from '../../helpers/tracking/mixpanel-initialize';
import setupHotjar from '../../helpers/tracking/hotjar';

import UserStore, { UserState } from '.'
import { actions } from '..';
import { filter, switchMap, take } from 'rxjs/operators';
import { USER_SET } from '../../rx-actions/user/set';


function isUserImpersonating() {
  try {
    const impersonate = JSON.parse(window.localStorage.impersonate);
    return impersonate.enabled;
  } catch (err) {
    return false;
  }
}

// NOTE: USER_SET not yet added to GlobalAction types, hence the Any<FixInRefactor>
actions.pipe(
  filter(action => {
    switch(action.type) {
      case USER_SET as Any<FixInRefactor>:
        return true;
      default:
        return false;
    }
  }),
  switchMap(() => UserStore.pipe(take(1)))
).subscribe((userState: UserState) => {

  // skip tracking if user is impersonating
  if (isUserImpersonating()) return;

  if (process.env.REACT_APP_HOTJAR_SITE_ID) {
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
      $name: user.fullName,
      $email: user.email,
      Organization: user.organization.name,
      organization_id: user.organization.id,
      is_admin: undefined,
      // FIXME: this used to be the below, but that property doesn't exist.
      //        so for now, explicitly passing undefined
      // is_admin: user.is_admin,
    });
  }
})