import styles from './styles.module.scss';

import React from 'react';

import { DensityUser } from '../../types';

import { Button, InputBox } from '@density/ui';

import ErrorBar from '../error-bar/index';
import logoDensityBlack from '../../assets/images/logo-black.svg';

import { impersonateUnset } from '../../rx-actions/impersonate';
import sessionTokenSet from '../../rx-actions/session-token/set';
import accounts from '../../client/accounts';

import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import rxConnect from '../../helpers/rx-connect-hoc';
import AccountStore from '../../rx-stores/account';

export class AccountRegistration extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.invitationData.email,
      invitationToken: this.props.invitationData.invitation_token,

      error: null,

      fullName: '',
      password: '',
      passwordConfirmation: '',
      coreConsent: false,
      marketingConsent: false,
    };
  }
  onSubmit() {
    return accounts().put('/users/register', {
      email: this.state.email,
      invitation_token: this.state.invitationToken,
      password: this.state.password,
      confirm_password: this.state.password,
      full_name: this.state.fullName,
      core_consent: this.state.coreConsent,
      marketing_consent: this.state.marketingConsent,
    }).then(response => {
      return this.props.onUserLoggedIn(response.data.session_token);
    }).catch(err => {
      this.setState({error: err.toString()});
    });
  }

  render() {
    return <div className={styles.accountRegistrationView}>
      <div className={styles.accountRegistrationSection}>

        <ErrorBar message={this.state.error} showRefresh />

        <div className={styles.accountRegistrationDensityLogo}>
          <img src={logoDensityBlack} alt="Density Logo" />
        </div>
        <p className={styles.accountRegistrationLead}>
          Let's create your Density account!
        </p>

        <div className={styles.accountRegistrationFormContainer}>
          <div className={styles.accountRegistrationForm}>
            <div className={styles.formControl}>
            <label className={styles.formControlLabel} htmlFor="account-registration-full-name">
              Full Name
              <span className={styles.formControlLabelRequired}>*</span>
            </label>
            <InputBox
              type="text"
              placeholder="Full Name ..."
              className={styles.accountRegistrationInput}
              id="account-registration-full-name"
              onChange={e => this.setState({fullName: e.target.value})}
              value={this.state.fullName}
              width="100%"
            />
            </div>
              
          <div className={styles.formControl}>
            <label className={styles.formControlLabel} htmlFor="account-registration-password">
              Password
              <span className={styles.formControlLabelRequired}>*</span>
            </label>
            <InputBox
              type="password"
              placeholder="Password"
              className={styles.accountRegistrationInput}
              id="account-registration-password"
              onChange={e => this.setState({password: e.target.value})}
              value={this.state.password}
              width="100%"
            />
          </div>
            
          <div className={styles.formControl}>
            <label className={styles.formControlLabel} htmlFor="account-registration-confirm-password">
              Confirm Password
              <span className={styles.formControlLabelRequired}>*</span>
            </label>
            <InputBox
              type="password"
              placeholder="Confirm password"
              className={styles.accountRegistrationInput}
              id="account-registration-confirm-password"
              onChange={e => this.setState({passwordConfirmation: e.target.value})}
              value={this.state.passwordConfirmation}
              width="100%"
            />
          </div>
            

            <div className={styles.accountRegistrationConsentContainer}>
              <label className={styles.accountRegistrationConsentLabel} htmlFor="account-registration-core-consent">
                <input
                  type="checkbox"
                  id="account-registration-core-consent"
                  className={styles.accountRegistrationCheckbox}
                  onChange={e => this.setState({coreConsent: e.target.checked})}
                />
                <p>I confirm, by completing this registration, that I have read, understand, and agree to the Density <a href="https://www.density.io/terms-of-sale" target="_blank" rel="noopener noreferrer">Subscription Agreement</a>.</p>
              </label>
    
              {/* <label className={styles.accountRegistrationConsentLabel} htmlFor="account-registration-marketing-consent">
                <input
                  type="checkbox"
                  id="account-registration-marketing-consent"
                  className={styles.accountRegistrationCheckbox}
                  onChange={e => this.setState({marketingConsent: e.target.checked})}
                />
                <p>I would like to sign up to receive marketing emails from Density (unsubscribe is available at any time).</p>
              </label> */}
            </div>

            <Button
              type="primary"
              variant="filled"
              width="100%"
              className={styles.accountRegistrationSubmitButton}
              onClick={this.onSubmit.bind(this)}
              disabled={!(
                this.state.password.length > 0 &&
                this.state.password === this.state.passwordConfirmation &&
                this.state.fullName.length > 0 &&
                this.state.email.indexOf('@') >= 0 &&
                this.state.coreConsent
              )}
            >Create Account</Button>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default rxConnect(AccountStore, state => {
  return {
    invitationData: state.invitationData,
  };
}, dispatch => {
  return {
    onUserLoggedIn(token) {
      dispatch(impersonateUnset());
      sessionTokenSet(dispatch, token).then(data => {
        const user: any = objectSnakeToCamel<DensityUser>(data);
        unsafeNavigateToLandingPage(user.organization.settings, null, true);
      });
    },
  };
})(AccountRegistration);
