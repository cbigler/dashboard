import React, { useEffect } from 'react';
import styles from './styles.module.scss';

import sessionTokenUnset from '../../rx-actions/session-token/unset';
import collectionSpacesSet from '../../rx-actions/collection/spaces-legacy/set';
import collectionSpaceHierarchySet from '../../rx-actions/collection/space-hierarchy/set';
import collectionTokensSet from '../../rx-actions/collection/tokens/set';
import collectionWebhooksSet from '../../rx-actions/collection/webhooks/set';
import collectionServicesSet from '../../rx-actions/collection/services/set';
import { UserActionTypes } from '../../types/users';
import UserStore from '../../rx-stores/user';
import accounts from '../../client/accounts';
import { showToast } from '../../rx-actions/toasts';

import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';

export default function Logout() {
  const dispatch: Any<FixInRefactor> = useRxDispatch();
  const user = useRxStore(UserStore);
  const userLoggedIn = user.data !== null;

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    async function performLogout() {
      try {
        await accounts().delete('/logout');
        dispatch(sessionTokenUnset());
        dispatch(collectionSpacesSet([]));
        dispatch(collectionSpaceHierarchySet([]));
        dispatch(collectionTokensSet([]));
        dispatch(collectionWebhooksSet([]));
        dispatch(collectionServicesSet([]));
        dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_SET, users: [] });
      } catch {
        showToast(dispatch, { text: 'Error logging out, please try again.', type: 'error' });
        window.location.hash = '#/account';
      }
    }
    if (userLoggedIn) {
      performLogout();
    }
  }, [ userLoggedIn ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className={styles.centered}>
      <div className={styles.navbarShell} />

      <h1>You have been logged out.</h1>
      <p>Please <a href="#/login">login</a> again to view the Density Dashboard.</p>

      {/* Logout from auth0, invalidating the global auth0 session */}
      {/* eslint-disable jsx-a11y/iframe-has-title */}
      <iframe style={{display: 'none'}} src="https://densityio.auth0.com/v2/logout"></iframe>
      {/* eslint-enable jsx-a11y/iframe-has-title */}
    </div>
  );
}
