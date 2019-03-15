import React from 'react';
import { connect } from 'react-redux';

import {
  DensityMark,
  Button,
  InputBox,
  Card,
  CardBody,
} from '@density/ui';

import ErrorBar from '../error-bar/index';
import AccountSetupHeader from '../account-setup-header/index';

import { impersonateUnset } from '../../actions/impersonate';
import sessionTokenSet from '../../actions/session-token/set';
import accounts from '../../client/accounts';

import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

export class AccountRegistration extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.invitationData.email,
      invitationToken: this.props.invitationData.invitation_token,

      error: null,

      fullName: '',
      nickname: '',
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
      nickname: this.state.nickname || this.generateNickname.apply(this),
      core_consent: this.state.coreConsent,
      marketing_consent: this.state.marketingConsent,
    }).then(response => {
      return this.props.onUserLoggedIn(response.data.session_token);
    }).catch(err => {
      this.setState({error: err.toString()});
    });
  }

  // Generate the default nickname if one isn't specified.
  generateNickname() {
    return this.state.fullName.split(' ')[0];
  }
  render() {
    return <div className="account-registration">

      <ErrorBar message={this.state.error} showRefresh />

      <AccountSetupHeader
        greeter="Create your account"
        detail={`Lets get your Density account set up, ${this.state.email}!`}
      />

      <div className="account-registration-density-logo">
        <DensityMark size={100} />
      </div>

      <div className="account-registration-card-container">
        <Card className="account-registration-card">
          <CardBody>
            <label className="account-registration-header" htmlFor="account-registration-full-name">
              Full Name
              <span className="account-registration-header-required">*</span>
            </label>
            <InputBox
              type="text"
              placeholder="Full Name ..."
              className="account-registration-input"
              id="account-registration-full-name"
              onChange={e => this.setState({fullName: e.target.value})}
              value={this.state.fullName}
              width="100%"
            />

            <label className="account-registration-header" htmlFor="account-registration-nickname">Nickname</label>
            <InputBox
              type="text"
              placeholder={
                this.state.fullName && this.state.fullName.indexOf(' ') >= 0 ? this.generateNickname.apply(this) : 'Nickname ...'
              }
              className="account-registration-input"
              id="account-registration-nickname"
              onChange={e => this.setState({nickname: e.target.value})}
              value={this.state.nickname}
              width="100%"
            />

            <label className="account-registration-header" htmlFor="account-registration-password">
              Password
              <span className="account-registration-header-required">*</span>
            </label>
            <InputBox
              type="password"
              placeholder="Password"
              className="account-registration-input"
              id="account-registration-password"
              onChange={e => this.setState({password: e.target.value})}
              value={this.state.password}
              width="100%"
            />

            <label className="account-registration-header" htmlFor="account-registration-confirm-password">
              Confirm Password
              <span className="account-registration-header-required">*</span>
            </label>
            <InputBox
              type="password"
              placeholder="Confirm password"
              className="account-registration-input"
              id="account-registration-confirm-password"
              onChange={e => this.setState({passwordConfirmation: e.target.value})}
              value={this.state.passwordConfirmation}
              width="100%"
            />

            <div className="account-registration-consent-container">
              <div className="account-registration-consent">
                <input
                  type="checkbox"
                  id="account-registration-core-consent"
                  className="account-registration-checkbox"
                  onChange={e => this.setState({coreConsent: e.target.checked})}
                />
                <label className="account-registration-consent-label" htmlFor="account-registration-core-consent">I confirm, by completing this registration, that I have read, understand, and agree to the Density <a href="https://www.density.io/msa" target="_blank" rel="noopener noreferrer">Subscription Agreement</a>.</label>
              </div>

              <div className="account-registration-consent">
                <input
                  type="checkbox"
                  id="account-registration-marketing-consent"
                  className="account-registration-checkbox"
                  onChange={e => this.setState({marketingConsent: e.target.checked})}
                />
                <label className="account-registration-consent-label" htmlFor="account-registration-marketing-consent">I would like to sign up to receive marketing emails from Density (unsubscribe is available at any time).</label>
              </div>
            </div>

            <Button
              type="primary"
              width="100%"
              className="account-registration-submit-button"
              size="large"
              onClick={this.onSubmit.bind(this)}
              disabled={!(
                this.state.password.length > 0 &&
                this.state.password === this.state.passwordConfirmation &&
                this.state.fullName.length > 0 &&
                (this.state.fullName.indexOf(' ') >= 0 || this.state.nickname.length > 0) &&
                this.state.email.indexOf('@') >= 0 &&
                this.state.coreConsent
              )}
            >Create Account</Button>
          </CardBody>
        </Card>
      </div>
    </div>;
  }
}

export default connect((state: any) => {
  return {
    invitationData: state.accountRegistration,
  };
}, dispatch => {
  return {
    onUserLoggedIn(token) {
      dispatch(impersonateUnset());
      dispatch<any>(sessionTokenSet(token)).then(data => {
        const user: any = objectSnakeToCamel(data);
        unsafeNavigateToLandingPage(user.organization.settings, null, true);
      });
    },
  };
})(AccountRegistration);
