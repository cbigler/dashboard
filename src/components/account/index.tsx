import styles from './styles.module.scss';

import React, { useState } from 'react';
import { connect } from 'react-redux';

import {
  InputBox,
  Button,
  Toast,
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppScrollView,
} from '@density/ui';
// import AppBar, { AppBarSection, AppBarTitle } from '@density/ui';

import FormLabel from '../form-label/index';
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
      email: this.props.user.data ? this.props.user.data.email : '',
      marketingConsent: this.props.user.data ? this.props.user.data.marketingConsent : false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fullName: nextProps.user.data.fullName || '',
      email: nextProps.user.data.email || '',
      marketingConsent: nextProps.user.data.marketingConsent,
    });
  }

  render() {
    const {
      user,
      onSubmitPassword,
      onSubmitUserUpdate,
    } = this.props;

    const canChangePassword = user.data && !user.data.isDemo && !user.data.organization.forceSsoLogin;

    return (
      <AppFrame>
        <AppPane>
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Account Management</AppBarTitle>
            </AppBarSection>
          </AppBar>
          <AppScrollView>
            <div className={styles.accountPage}>

              {/* Render any errors from the server */}
              <ErrorBar message={this.state.error} />

              {/* GENERAL INFO */}
              <div className={styles.accountPageSection}>
                <div className={styles.accountPageSectionHeader}>
                  <div className={styles.accountPageSectionHeaderText}>General Info</div>

                  {/* Edit / Cancel button */}
                  {user.data && !user.data.isDemo ? (
                    <Button
                      className={styles.accountPageSectionHeaderActionButton}
                      onClick={() => {
                        // If currently in edit mode, then reset all edits before transitioning back to normal
                        // mode.
                        if (this.state.mode === EDIT) {
                          this.setState({
                            mode: NORMAL,

                            // Reset back to the values in the user prop (what's in redux)
                            fullName: user.data.fullName || '',
                            email: user.data.email || '',
                          });
                        } else {
                          this.setState({mode: EDIT});
                        }
                      }}
                    >{this.state.mode === EDIT ? 'Cancel' : 'Edit'}</Button>
                  ) : null}
                  {this.state.mode === EDIT ? (
                    <Button
                      className={styles.accountPageSectionHeaderActionButton}
                      onClick={() => {
                        onSubmitUserUpdate(this.state.fullName, this.state.marketingConsent)
                          .then(() => {
                            this.setState({mode: NORMAL});
                          }).catch(error => {
                            this.setState({error});
                          });
                      }}
                    >Save Changes</Button>
                  ) : null}
                </div>

                <div className={styles.accountPageSectionBody}>
                  <div className={styles.generalInfoForm}>
                    <div className={styles.generalInfoFormFieldContainer}>
                      <FormLabel
                        htmlFor="account-name"
                        label="Name"
                        input={<InputBox
                          type="text"
                          placeholder="Name"
                          width="100%"
                          value={this.state.fullName}
                          onChange={e => this.setState({fullName: e.target.value})}
                          disabled={this.state.mode !== EDIT}
                          id="account-full-name"
                        />}
                      />
                    </div>
                    <div className={styles.generalInfoFormFieldContainer}>
                      <FormLabel
                        htmlFor="account-email"
                        label="Email"
                        input={<InputBox
                          type="email"
                          placeholder="Email"
                          width="100%"
                          value={this.state.email}
                          onChange={e => this.setState({email: e.target.value})}
                          disabled={true}
                          id="account-email"
                        />}
                      />
                    </div>
                    <div className={styles.generalInfoFormFieldContainer}>  
                      <FormLabel
                        htmlFor="account-organization"
                        label="Organization"
                        input={<InputBox
                          type="text"
                          value={user.data && user.data.organization ? user.data.organization.name : '(unknown organization)'}
                          width="100%"
                          onChange={e => this.setState({email: e.target.value})}
                          disabled={true}
                          id="account-organization"
                        />}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* PASSWORD */}
              {canChangePassword ? (
                <div className={styles.accountPageSection}>
                  <div className={styles.accountPageSectionHeader}>
                    <div className={styles.accountPageSectionHeaderText}>Password</div>
                  </div>
                  <div className={styles.accountPageSectionBody}>

                  {/* TODO: put password form back here */}
                    
                  </div>
                </div>
              ): null}
              
              <div className={styles.accountDeactivateContainer}>
                <span>If you&apos;d like to deactivate your account, please <a href="mailto:support@density.io?subject=I want to deactivate my Density account"> contact support</a>.</span>
              </div>
            </div>
          </AppScrollView>
        </AppPane>
      </AppFrame>

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
    onSubmitUserUpdate(fullName, marketingConsent) {
      return dispatch<any>(userUpdate(fullName, marketingConsent));
    },
    onHideSuccessToast() {
      dispatch<any>(hideModal());
    },
  };
})(Account);
