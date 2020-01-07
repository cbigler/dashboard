import styles from './styles.module.scss';

import React from 'react';

import { Button } from '@density/ui/src';
import { InputStackItem } from '../input-stack/index';

import logoDensityBlack from '../../assets/images/logo-black.svg';
import ErrorBar from '../error-bar/index';

import accounts from '../../client/accounts';
import rxConnect from '../../helpers/rx-connect-hoc';
import AccountStore from '../../rx-stores/account';

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
    return accounts().put('/users/password/reset', {
      password_reset_token: this.props.forgotPasswordToken,
      new_password: this.state.password,
      confirm_password: this.state.password,
    }).then(response => {
      return this.props.onUserLoggedIn(response.data.session_token);
    }).catch(err => {
      this.setState({error: err.toString(), loading: false});
    });
  }

  render() {
    return <div className={styles.accountForgotPasswordView}>
      <div className={styles.accountForgotPasswordSection}>
        <ErrorBar message={this.state.error} showRefresh />

        <div className={styles.accountForgotPasswordDensityLogo}>
          <img src={logoDensityBlack} alt="Density Logo" />
        </div>
        <p className={styles.accountForgotPasswordLead}>
          Please set your new password.
        </p>

        <div className={styles.accountForgotPasswordFormContainer}>
          <div className={styles.accountForgotPasswordForm}>
            <div className={styles.formControl}>
            <label className={styles.formControlLabel}>Your New Password</label>
              <InputStackItem
                type="password"
                placeholder="New Password"
                value={this.state.password}
                onChange={e => this.setState({password: e.target.value})}
              />
            </div>
            <div className={styles.formControl}>
              <label className={styles.formControlLabel}>Confirm Password</label>
              <InputStackItem
                type="password"
                placeholder="Confirm Password"
                invalid={this.state.passwordConfirmation.length > 0 && this.state.password !== this.state.passwordConfirmation}
                value={this.state.passwordConfirmation}
                onChange={e => this.setState({passwordConfirmation: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.accountForgotPasswordSubmitButton}>
            <Button
              variant="filled"
              onClick={this.onSubmit.bind(this)}
              disabled={this.state.loading || !(this.state.password.length > 0 && this.state.password === this.state.passwordConfirmation)}
            >Update Password</Button>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default rxConnect(AccountStore, state => {
  return {forgotPasswordToken: state.passwordResetToken};
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
