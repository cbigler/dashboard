import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import {
  Button,
  CardLoading,
  DensityMark,
  Icons,
  Toast,
} from '@density/ui';

import { accounts } from '../../client';
import redirectAfterLogin from '../../actions/miscellaneous/redirect-after-login';
import sessionTokenSet from '../../actions/session-token/set';
import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';

import { InputStackItem, InputStackGroup } from '../input-stack/index';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

export const LOGIN = 'LOGIN',
             FORGOT_PASSWORD = 'FORGOT_PASSWORD';

export class Login extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      view: LOGIN,
      email: '',
      password: '',
      loading: false,
      error: null,

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
    return accounts.users.login({
      email: this.state.email,
      password: this.state.password,
    }).then(token => {
      this.setState({loading: false, error: null});
      this.props.onUserSuccessfullyLoggedIn(token, this.props.redirectAfterLogin);
    }).catch(error => {
      this.setState({loading: false, error: error.toString()});
    });
  }

  onForgotPassword = () => {
    this.setState({loading: true, error: null});
    return accounts.users.password_forgot({
      email: this.state.email,
    }).then(resp => {
      this.setState({loading: false, error: null, forgotPasswordConfirmation: resp.message});
    }).catch(error => {
      this.setState({loading: false, error});
    });
  }

  renderLoginForm() {
    return <div className="login-form-container">
      {/* Input stack used to enter login info */}
      <InputStackGroup className="login-form">
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
      <div className={classnames('login-submit-button', {loading: this.state.loading})}>
        <Button 
          size="large"
          onClick={this.onLogin}
          disabled={!this.isLoginFormValid()}
        >Login</Button>
      </div>

      {/* Move to forgot password view */}
      <div
        className="login-forgot-password-link"
        onClick={() => this.setState({view: FORGOT_PASSWORD, error: null})}
      >Forgot Password</div>
    </div>;
  }

  renderForgotPasswordForm() {
    return <div className="login-form-container">
      {this.state.forgotPasswordConfirmation ? <div className="login-toast">
        <Toast
          type="success"
          icon={<Icons.Check color="white" />}
          onDismiss={() => this.setState({forgotPasswordConfirmation: null})}
        >
          {this.state.forgotPasswordConfirmation}
        </Toast>
      </div> : null}

      <h2 className="login-password-reset-title">Send password change request</h2>
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
      <div className={classnames('login-submit-button', {loading: this.state.loading})}>
        <Button 
          onClick={this.onForgotPassword}
          size="large"
          disabled={!this.isForgotPasswordFormValid.apply(this)}
        >Send Request</Button>
      </div>

      {/* Move to back to login page */}
      <div
        className="login-forgot-password-back-link"
        onClick={() => this.setState({view: LOGIN, error: null})}
      >Back to login</div>
    </div>;
  }

  render() {
    return <div className="login">

      { this.state.loading ? <CardLoading indeterminate={true} /> : null }

      <div className="login-section">
        {/* Render a toast if the password reset process was successful */}
        {this.state.referredFromForgotPassword ? (
          <div className="login-toast login-toast-forgot-password">
            <Toast
              type="success"
              icon={<Icons.No color="white" />}
              onDismiss={() => this.setState({referredFromForgotPassword: false})}
            >
              Password reset successful, log in using your new credentials.
            </Toast>
          </div>
        ) : null}

        {this.props.user && this.props.user.error ? (
          <div className="login-toast login-toast-forgot-password">
            <Toast
              className="login-toast login-toast-forgot-password"
              type="danger"
              title="Error fetching user"
              icon={<Icons.No color="white" />}
            >
              {this.props.user.error}
            </Toast>
          </div>
        ) : null}

        {/* Render any errors with previous login attempts */}
        {this.state.error ? (
          <div className="login-toast">
            <Toast
              type="danger"
              title="Incorrect password"
              icon={<Icons.No color="white" />}
              onDismiss={() => this.setState({error: null})}
            >
              {this.state.error}
            </Toast>
          </div>
        ) : null}

        <div className="login-density-logo">
          <DensityMark size={100} />
        </div>

        {/* Login inputs */}
        {this.state.view === LOGIN ?
          this.renderLoginForm.apply(this) :
          this.renderForgotPasswordForm.apply(this)}
      </div>
    </div>;
  }
}


export default connect((state: any) => ({
  user: state.user,
  redirectAfterLogin: state.miscellaneous.redirectAfterLogin,
}), dispatch => {
  return {
    onUserSuccessfullyLoggedIn(token, redirect) {
      dispatch<any>(sessionTokenSet(token)).then(data => {
        const user: any = objectSnakeToCamel(data);
        unsafeNavigateToLandingPage(user.organization.settings, redirect);
        dispatch(redirectAfterLogin(null));
      });
    },
  };
})(Login);
