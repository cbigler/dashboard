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


const GeneralInfoSection = props => {

  const { user, onSubmitUserUpdate } = props;

  const [mode, setMode] = useState(NORMAL);
  
  // this state is only used for editing the user info, not for display (display is always pulled from props)
  const [userFullName, setUserFullName] = useState(user.data.fullName || '');

  const handleEditButtonClick = evt => {
    setMode(EDIT);
  }

  const handleCancelButtonClick = evt => {
    setUserFullName(user.data.fullName || '');
    setMode(NORMAL);
  }

  const handleSaveButtonClick = evt => {
    onSubmitUserUpdate(userFullName)
      .then(setMode(NORMAL))
  }

  return (
    <div className={styles.accountPageSection}>
      <div className={styles.accountPageSectionHeader}>
        <div className={styles.accountPageSectionHeaderText}>General Info</div>

        {/* Edit / Cancel button */}
        {mode === NORMAL && user.data && !user.data.isDemo ? (
          <Button onClick={handleEditButtonClick}>Edit</Button>
        ) : null}
        {mode === EDIT ? (
          <Button onClick={handleCancelButtonClick}>Cancel</Button>
        ) : null}
        {mode === EDIT ? (
          <Button type="primary" onClick={handleSaveButtonClick}>Save Changes</Button>
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
                value={mode === NORMAL ? user.data.fullName : userFullName}
                onChange={e => setUserFullName(e.target.value)}
                disabled={mode !== EDIT}
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
                value={user.data.email}
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
                disabled={true}
                id="account-organization"
              />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const PasswordSection = props => {
  return (
    <div className={styles.accountPageSection}>
      <div className={styles.accountPageSectionHeader}>
        <div className={styles.accountPageSectionHeaderText}>Password</div>
      </div>
      <div className={styles.accountPageSectionBody}>
        <div className={styles.accountPageSectionPopoutFormContainer}>
          <div className={styles.accountPageSectionPopoutFormText}>
            <header>Change your password</header>
            <p>Update your super-secret password</p>
          </div>
          <div className={styles.accountPageSectionPopoutForm}>
            
          </div>
        </div>    
      </div>
    </div>
  )
}

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
            {/* Render any errors from the server */}
            <ErrorBar message={this.state.error} />
            <div className={styles.accountPage}>

              {/* GENERAL INFO */}
              <GeneralInfoSection user={user} onSubmitUserUpdate={onSubmitUserUpdate} />
              
              {/* PASSWORD */}
              {canChangePassword ? (
                <PasswordSection />
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
    onSubmitUserUpdate(fullName) {
      return dispatch<any>(userUpdate(fullName));
    },
    onHideSuccessToast() {
      dispatch<any>(hideModal());
    },
  };
})(Account);
