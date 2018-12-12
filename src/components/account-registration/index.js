import React from 'react';
import { connect } from 'react-redux';

import Mark from '@density/ui-density-mark';
import Button from '@density/ui-button';
import InputBox from '@density/ui-input-box';

import Card, { CardBody } from '@density/ui-card';

import ErrorBar from '../error-bar/index';
import AccountSetupHeader from '../account-setup-header/index';

import redirectAfterLogin from '../../actions/miscellaneous/redirect-after-login';
import sessionTokenSet from '../../actions/session-token/set';
import { accounts } from '../../client';

import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

export class AccountRegistration extends React.Component {
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
    };
  }
  onSubmit() {
    return accounts.users.register({
      email: this.state.email,
      invitation_token: this.state.invitationToken,
      password: this.state.password,
      full_name: this.state.fullName,
      nickname: this.state.nickname || this.generateNickname.apply(this),
    }).then(response => {
      return this.props.onUserLoggedIn(response.session_token, this.props.redirectAfterLogin);
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
        <Mark size={100} />
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
            />

            <br />
            <Button
              className="account-registration-submit-button"
              size="large"
              onClick={this.onSubmit.bind(this)}
              disabled={!(
                this.state.password.length > 0 &&
                this.state.password === this.state.passwordConfirmation &&
                this.state.fullName.length > 0 && 
                (this.state.fullName.indexOf(' ') >= 0 || this.state.nickname.length > 0) &&
                this.state.email.indexOf('@') >= 0
              )}
            >Create Account</Button>
          </CardBody>
        </Card>
      </div>
    </div>;
  }
}

export default connect(state => {
  return {
    invitationData: state.accountRegistration,
    redirectAfterLogin: state.miscellaneous.redirectAfterLogin,
  };
}, dispatch => {
  return {
    onUserLoggedIn(token, redirect) {
      dispatch(sessionTokenSet(token)).then(data => {
        const user = objectSnakeToCamel(data);
        unsafeNavigateToLandingPage(user.organization.settings, redirect);
        dispatch(redirectAfterLogin(null));
      });
    },
  };
})(AccountRegistration);
