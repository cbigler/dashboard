import React from 'react';
import { connect } from 'react-redux';

import {
  InputBox,
  Card,
  CardHeader,
  CardBody,
  CardLoading,
  Button,
  Toast,
} from '@density/ui';

import FormLabel from '../form-label/index';
import ModalHeaderActionButton from '../modal-header-action-button/index';
import ErrorBar from '../error-bar/index';

import userResetPassword from '../../actions/user/reset-password';
import userUpdate from '../../actions/user/update';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

export const NORMAL = 0;
export const EDIT = 1;
export const PASSWORD_RESET = 2;

export class Account extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      mode: NORMAL,

      error: null,
      password: '',
      currentPassword: '',
      passwordConfirmation: '',

      // Initialize with a prop passing the initial value from the store
      fullName: this.props.user.data ? this.props.user.data.fullName : '',
      nickname: this.props.user.data ? this.props.user.data.nickname : '',
      email: this.props.user.data ? this.props.user.data.email : '',
      marketingConsent: this.props.user.data ? this.props.user.data.marketingConsent : false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fullName: nextProps.user.data.fullName || '',
      nickname: nextProps.user.data.nickname || '',
      email: nextProps.user.data.email || '',
      marketingConsent: nextProps.user.data.marketingConsent,
    });
  }

  // Generate the default nickname if one isn't specified.
  generateNickname() {
    return this.state.fullName.indexOf(' ') >= 0 ? this.state.fullName.split(' ')[0] : undefined;
  }
  render() {
    const {
      user,
      onSubmitPassword,
      onSubmitUserUpdate,
    } = this.props;

    const canChangePassword = user.data && !user.data.isDemo && !user.data.organization.forceSsoLogin;

    return (
      <div className="account-container">
        <div className="account">
          {/* Render any errors from the server */}
          <ErrorBar message={this.state.error} />

          {this.props.activeModal.name === 'account-password-reset' && this.props.activeModal.visible ? <div className="account-password-reset-toast">
            <Toast
              type="success"
              icon={<span className="account-password-reset-icon">&#xe908;</span>}
              title="Password updated!"
              onDismiss={this.props.onHideSuccessToast}
            >
              Your password has been successfully updated.
            </Toast>
          </div> : null}

          <Card className="account-card" type="modal">
            {this.props.loading ? <CardLoading indeterminate /> : null}
            <CardHeader>
              {this.state.mode === EDIT ? 'Edit Account' : 'Account'}

              {/* Edit / Cancel button */}
              {user.data && !user.data.isDemo ? <ModalHeaderActionButton
                onClick={() => {
                  // If currently in edit mode, then reset all edits before transitioning back to normal
                  // mode.
                  if (this.state.mode === EDIT) {
                    this.setState({
                      mode: NORMAL,

                      // Reset back to the values in the user prop (what's in redux)
                      fullName: user.data.fullName || '',
                      nickname: user.data.nickname || '',
                      email: user.data.email || '',
                    });
                  } else {
                    this.setState({mode: EDIT});
                  }
                }}
                className="account-edit-button"
              >{this.state.mode === EDIT ? 'Cancel' : 'Edit'}</ModalHeaderActionButton> : null}
            </CardHeader>

            <CardBody>
              <div className="account-name-container">
                <FormLabel
                  className="account-full-name-container"
                  htmlFor="account-full-name"
                  label="Full Name"
                  input={<InputBox
                    type="text"
                    placeholder="Full Name"
                    value={this.state.fullName}
                    onChange={e => this.setState({fullName: e.target.value})}
                    disabled={this.state.mode !== EDIT}
                    id="account-full-name"
                  />}
                />

                <FormLabel
                  className="account-nickname-container"
                  htmlFor="account-nickname"
                  label="Nickname"
                  input={<InputBox
                    type="text"
                    placeholder={this.generateNickname() || 'Nickname'}
                    value={this.state.nickname}
                    onChange={e => this.setState({nickname: e.target.value})}
                    disabled={this.state.mode !== EDIT}
                    id="account-nickname"
                  />}
                />
              </div>

              <FormLabel
                className="account-email-container"
                htmlFor="account-email"
                label="Email"
                input={<InputBox
                  type="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={e => this.setState({email: e.target.value})}
                  disabled={true}
                  id="account-email"
                />}
              />

              <FormLabel
                className="account-organization-container"
                htmlFor="account-organization"
                label="Organization"
                input={<InputBox
                  type="text"
                  value={user.data && user.data.organization ? user.data.organization.name : '(unknown organization)'}
                  onChange={e => this.setState({email: e.target.value})}
                  disabled={true}
                  id="account-organization"
                />}
              />

              <div className="account-consent-container">
                <div className="account-consent">
                  <input
                    type="checkbox"
                    id="account-marketing-consent"
                    className="account-checkbox"
                    onChange={e => this.setState({marketingConsent: e.target.checked})}
                    defaultChecked={user.data && user.data.marketingConsent}
                    disabled={this.state.mode !== EDIT}
                  />
                  <label htmlFor="account-marketing-consent">I want to receive marketing emails from Density.</label>
                </div>
              </div>

              {/* Trigger changing the password */}
              {this.state.mode === NORMAL && canChangePassword ? <FormLabel
                className="account-change-password-link-container"
                label="Password"
                htmlFor="account-change-password"
                input={ <div id="account-change-password" className="account-change-password-value">
                  <span onClick={() => this.setState({mode: PASSWORD_RESET})}>Change Password</span>
                </div>}
              /> : null}

              {/* The form to change the password that is triggered. */}
              {this.state.mode === PASSWORD_RESET ? <div className="account-change-password-form-container">
                <label className="account-change-password-form-header">Password</label>
                <InputBox
                  type="password"
                  placeholder="Type old password"
                  value={this.state.currentPassword}
                  onChange={e => this.setState({currentPassword: e.target.value})}
                />
                <InputBox
                  type="password"
                  placeholder="Type new password (minimum of 8 characters)"
                  value={this.state.password}
                  onChange={e => this.setState({password: e.target.value})}
                />
                <InputBox
                  type="password"
                  placeholder="Confirm new password"
                  value={this.state.passwordConfirmation}
                  onChange={e => this.setState({passwordConfirmation: e.target.value})}
                />
                <Button
                  onClick={() => {
                    if (this.state.password === this.state.passwordConfirmation) {
                      this.setState({error: null});
                      return onSubmitPassword(this.state.currentPassword, this.state.password)
                        .then(() => {
                          this.setState({mode: NORMAL});
                        })
                        .catch(error => {
                          this.setState({ error });
                        });
                    } else {
                      this.setState({error: `Passwords don't match.`});
                    }
                  }}
                  disabled={this.state.password.length < 8}
                >Change Password</Button>
              </div> : null}

              {this.state.mode === NORMAL ? <div className="account-deactivate-container">
                <span>If you&apos;d like to deactivate your account, please <a href="mailto:support@density.io?subject=I want to deactivate my Density account"> contact support</a>.</span>
              </div> : null}

              <div className="account-submit-user-details">
                {this.state.mode === EDIT ? <Button
                  onClick={() => {
                    onSubmitUserUpdate(this.state.fullName, this.state.nickname, this.state.marketingConsent)
                      .then(() => {
                        this.setState({mode: NORMAL});
                      }).catch(error => {
                        this.setState({error});
                      });
                  }}
                >Save Changes</Button> : null}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default connect((state: any) => {
  return {
    user: state.user,
    activeModal: state.activeModal,
    loading: state.user.loading,
  };
}, dispatch => {
  return {
    onSubmitPassword(currentPassword, password) {
      return dispatch<any>(userResetPassword(currentPassword, password)).then(() => {
        dispatch<any>(showModal('account-password-reset'));
      });
    },
    onSubmitUserUpdate(fullName, nickname, marketingConsent) {
      return dispatch<any>(userUpdate(fullName, nickname, marketingConsent));
    },
    onHideSuccessToast() {
      dispatch<any>(hideModal());
    },
  };
})(Account);
