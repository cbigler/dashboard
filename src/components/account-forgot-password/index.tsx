import React from 'react';
import { connect } from 'react-redux';

import {
  Button,
  InputStackItem,
  InputStackGroup,
} from '@density/ui';

import logoDensityBlack from '../../assets/images/logo-black.svg';
import ErrorBar from '../error-bar/index';

import { accounts } from '../../client';

export class AccountForgotPassword extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,

      password: '',
      passwordConfirmation: '',
    };
  }
  onSubmit() {
    this.setState({loading: true});
    return accounts.users.password_reset({
      password_reset_token: this.props.forgotPasswordToken,
      new_password: this.state.password,
      confirm_password: this.state.password,
    }).then(response => {
      return this.props.onUserLoggedIn(response.session_token);
    }).catch(err => {
      this.setState({error: err.toString(), loading: false});
    });
  }

  render() {
    return <div className="login-section">
      <ErrorBar message={this.state.error} showRefresh />

      <div className="login-density-logo">
        <img src={logoDensityBlack} />
      </div>
      <p className="login-lead">
        Please set your new password.
      </p>

      <div className="account-forgot-password-form">
        <InputStackGroup>
          <InputStackItem
            type="password"
            placeholder="New Password"
            value={this.state.password}
            onChange={e => this.setState({password: e.target.value})}
          />
          <InputStackItem
            type="password"
            placeholder="Confirm Password"
            invalid={this.state.passwordConfirmation.length > 0 && this.state.password !== this.state.passwordConfirmation}
            value={this.state.passwordConfirmation}
            onChange={e => this.setState({passwordConfirmation: e.target.value})}
          />
        </InputStackGroup>
      </div>

      <div className="account-forgot-password-submit-button">
        <Button
          onClick={this.onSubmit.bind(this)}
          disabled={this.state.loading || !(this.state.password.length > 0 && this.state.password === this.state.passwordConfirmation)}
        >Update Password</Button>
      </div>
    </div>;
  }
}

export default connect((state: any) => {
  return {forgotPasswordToken: state.accountForgotPassword};
}, dispatch => {
  return {
    onUserLoggedIn() {
      // Set a value in localstorage to indicate that the user just reset their password. This
      // allows us to display a sucess popup on the login page after redirecting.
      window.localStorage.referredFromForgotPassword = 'true';

      // Reload the page, and navigate to the login page.
      window.location.href = '#/login';
    },
  };
})(AccountForgotPassword);
