import React from 'react';
import styles from './styles.module.scss';

import useRxStore from '../../../helpers/use-rx-store';
import MiscellaneousStore from '../../../rx-stores/miscellaneous';

export default function LoginError() {
  const loginError = useRxStore(MiscellaneousStore).loginError;
  delete window.localStorage.auth0LoginError;
  return (
    <div className={styles.centered}>
      <div className={styles.navbarShell} />

      <h1>Login Error: {loginError}</h1>
      <p><a href="#/login">Click here to go back to the login page.</a></p>

      {/* eslint-disable jsx-a11y/iframe-has-title */}
      {/* Log out of the global auth0 session, so that clicking on the "login" link goes back to the login page */}
      <iframe style={{display: 'none'}} src="https://densityio.auth0.com/v2/logout"></iframe>
      {/* eslint-enable jsx-a11y/iframe-has-title */}
    </div>
  );
}
