import React from 'react';
import classnames from 'classnames';

import { DensityUser } from '../../types';

import {
  Button,
  CardLoading,
  Icons,
  Toast,
  ToastContext,
} from '@density/ui';

import accounts from '../../client/accounts';
import { impersonateUnset } from '../../rx-actions/impersonate';
import sessionTokenSet from '../../rx-actions/session-token/set';
import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';

import { InputStackItem, InputStackGroup } from '../input-stack/index';

import logoDensityBlack from '../../assets/images/logo-black.svg';
import logoGoogleG from '../../assets/images/logo-google-g.svg';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import webAuth from "../../auth0";
import styles from './styles.module.scss';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import redirectAfterLogin from '../../rx-actions/miscellaneous/redirect-after-login';


export const LOGIN = 'LOGIN',
             FORGOT_PASSWORD = 'FORGOT_PASSWORD';

export class Login extends React.Component<any, any> {
  constructor(props) {
    super(props);

    let error: string | null = null;
    let errorTitle: string | null = null;
    // check to see if we have an error from logging in with auth0
    if (window.localStorage && window.localStorage.auth0LoginError) {
      error = window.localStorage.auth0LoginError;
      errorTitle = 'Login Failure';
      delete window.localStorage.auth0LoginError;
    }

    this.state = {
      view: LOGIN,
      email: '',
      password: '',
      loading: false,
      error,
      errorTitle,

      // If we were just at the forgot password page, then show a popup to the user telling them
      // that their password reset was successful.
      referredFromForgotPassword: window.localStorage && window.localStorage.referredFromForgotPassword === 'true',
    };

    // Also, unset that forgot password referer flag now that it has been noted into the state of
    // the login page component (on future page loads, the forgot password page is no longer the
    // referrer)
    if (window.localStorage && window.localStorage.referredFromForgotPassword) {
      delete window.localStorage.referredFromForgotPassword;
    }
  }

  isLoginFormValid = () => {
    return this.state.view === LOGIN &&
      this.state.email.indexOf('@') >= 0 &&
      this.state.password.length > 0 &&
      !this.state.loading;
  }

  isForgotPasswordFormValid = () => {
    return this.state.view === FORGOT_PASSWORD &&
      this.state.email.indexOf('@') >= 0 &&
      !this.state.loading;
  }

  onEnter = e => {
    if (e.key === 'Enter') {
      if (this.isLoginFormValid()) {
        this.onLogin();
      } else if (this.isForgotPasswordFormValid()) {
        this.onForgotPassword();
      }
    }
  }

  onLogin = () => {
    this.setState({loading: true, error: null});
    return accounts().post('/login', {
      email: this.state.email,
      password: this.state.password,
    }).then(response => {
      this.setState({loading: false, error: null});
      this.props.onUserSuccessfullyLoggedIn(response.data, this.props.redirectAfterLogin);
    }).catch(error => {
      const errorText = error.toString();
      this.setState({
        loading: false,
        error: errorText.endsWith('403') ? 'This email and password combination doesn\'t match our records' : errorText
      });
    });
  }

  onForgotPassword = () => {
    this.setState({loading: true, error: null});
    return accounts().put('/users/password/forgot', {
      email: this.state.email,
    }).then(resp => {
      this.setState({loading: false, error: null, forgotPasswordConfirmation: resp.data.message});
    }).catch(error => {
      this.setState({loading: false, error});
    });
  }

  renderLoginForm() {
    return <div className={styles.loginFormContainer}>
      {/* Input stack used to enter login info */}
      <div className={classnames(styles.loginSubmitButton, styles.google, {[styles.loading]: this.state.loading})}>
        <Button
          variant="filled"
          width="100%"
          onClick={() => {
            // Store the orginating origin in localStorage from the oauth request. This is used so
            // that we can redirect to the login route on the correct version of the dashboard as
            // soon as possible in the oauth callback. For example, a user tried to login via oauth
            // on a preview link, and normally, it would redirect to the staging dashboard, not the
            // preview link. Store the current url so we can redirect back to here after logging in.
            const hashIndex = window.location.href.indexOf('#');
            window.localStorage.loginOAuthOrigin = window.location.href.slice(0, hashIndex).replace(/\/$/, '');

            webAuth.authorize({
              connection: 'google-oauth2',
            });
          }}
        >
          <img className={styles.iconGoogleLogin} src={logoGoogleG} alt="Google Logo" />
          Log in with Google
        </Button>
      </div>

      <p className={styles.loginSsoDivider}>or</p>

      <InputStackGroup>
        <InputStackItem
          type="email"
          placeholder="Email Address"
          invalid={this.state.email.length > 0 && this.state.email.indexOf('@') === -1}
          onChange={e => this.setState({email: e.target.value})}
          onKeyPress={this.onEnter}
          value={this.state.email}
        />
        <InputStackItem
          type="password"
          placeholder="Password"
          onChange={e => this.setState({password: e.target.value})}
          onKeyPress={this.onEnter}
          value={this.state.password}
        />
      </InputStackGroup>

      {/* Submit the form! */}
      <div className={classnames(styles.loginSubmitButton, styles.email, {[styles.loading]: this.state.loading})}>
        <Button
          width="100%"
          type="primary"
          variant="filled"
          onClick={this.onLogin}
          disabled={!this.isLoginFormValid()}
        >Login</Button>
      </div>

      {/* Move to forgot password view */}
      <div
        className={classnames(styles.loginActionSecondary, styles.loginForgotPasswordLink)}
        onClick={() => this.setState({view: FORGOT_PASSWORD, error: null})}
      >Forgot Password</div>
    </div>;
  }

  renderForgotPasswordForm() {
    return <div className={classnames(styles.loginFormContainer, styles.loginFormReset)}>
      <p className={styles.loginFormResetHeader}>We'll send a recovery link to:</p>
      <InputStackGroup>
        <InputStackItem
          type="email"
          placeholder="Email Address"
          invalid={this.state.email.length > 0 && this.state.email.indexOf('@') === -1}
          onChange={e => this.setState({email: e.target.value, error: null})}
          onKeyPress={this.onEnter}
          value={this.state.email}
        />
      </InputStackGroup>

      {/* Submit the form! */}
      <div className={classnames(styles.loginSubmitButton, styles.email, {[styles.loading]: this.state.loading})}>
        <Button
          onClick={this.onForgotPassword}
          disabled={!this.isForgotPasswordFormValid()}
          variant="filled"
        >Send Request</Button>
      </div>

      {/* Move to back to login page */}
      <div
        className={styles.loginActionSecondary}
        onClick={() => this.setState({view: LOGIN, error: null})}
      >Back to login</div>
    </div>;
  }

  render() {
    return <div className={styles.login}>

      { this.state.loading ? <CardLoading indeterminate={true} /> : null }

      <div className={styles.loginSection}>
        {/* Render a toast if the password reset request worked */}
        {this.state.forgotPasswordConfirmation ? <div className={styles.loginToast}>
          <ToastContext.Provider value="MULTILINE">
            <Toast
              visible
              icon={<Icons.Check color="white" />}
              onDismiss={() => this.setState({forgotPasswordConfirmation: null})}
            >
              {this.state.forgotPasswordConfirmation}
            </Toast>
          </ToastContext.Provider>
        </div> : null}

        {/* Render a toast if the password reset process was successful */}
        {this.state.referredFromForgotPassword ? (
          <div className={classnames(styles.loginToast, styles.loginToastForgotPassword)}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                visible
                icon={<Icons.No color="white" />}
                onDismiss={() => this.setState({referredFromForgotPassword: false})}
              >
                Password reset successful, log in using your new credentials.
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        {this.props.user && this.props.user.error ? (
          <div className={classnames(styles.loginToast, styles.loginToastForgotPassword)}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                type="error"
                visible
                title="Error fetching user"
                icon={<Icons.No color="white" />}
              >
                {this.props.user.error}
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        {/* Render any errors with previous login attempts */}
        {this.state.error ? (
          <div className={styles.loginToast}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                type="error"
                visible
                title={this.state.errorTitle || 'Incorrect password'}
                icon={<Icons.No color="white" />}
                onDismiss={() => this.setState({error: null})}
              >
                <span>{this.state.error.message || this.state.error}</span>
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        <div className={styles.loginDensityLogo}>
          <img src={logoDensityBlack} alt="Density Logo" />
        </div>

        <p className={styles.loginLead}>
          Log in to your Density account.
        </p>

        {/* Login inputs */}
        {this.state.view === LOGIN ? this.renderLoginForm() : this.renderForgotPasswordForm()}
        <p className={styles.loginTermsAndPrivacy}>
          <a href="https://www.density.io/privacy-policy/" target="_blank" rel="noopener noreferrer"> Privacy Policy</a>{' '}
          and <a href="https://www.density.io/docs/msa.pdf" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
        </p>
      </div>
    </div>;
  }
}


const ConnectedLogin: React.FunctionComponent = () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const miscellaneous = useRxStore(MiscellaneousStore);

  const redirectAfterLoginState: Any<FixInRefactor> = miscellaneous.redirectAfterLogin;

  const onUserSuccessfullyLoggedIn = (token, redirect) => {
    dispatch(impersonateUnset());
    sessionTokenSet(dispatch, token).then(data => {
      const user = objectSnakeToCamel<DensityUser>(data);
      unsafeNavigateToLandingPage(user.organization.settings, redirect);
      dispatch(redirectAfterLogin(null) as Any<FixInRefactor>);
    });
  };

  return (
    <Login
      user={user}
      redirectAfterLogin={redirectAfterLoginState}
      onUserSuccessfullyLoggedIn={onUserSuccessfullyLoggedIn}
    />
  )
}

export default ConnectedLogin;
