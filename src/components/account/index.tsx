import styles from './styles.module.scss';

import React, { useState } from 'react';
import { connect } from 'react-redux';

import {
  InputBox,
  PhoneInputBox,
  Switch,
  Button,
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
import InputBoxInfo from '../input-box-info';

import userResetPassword from '../../actions/user/reset-password';
import userUpdate from '../../actions/user/update';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import colors from '@density/ui/variables/colors.json';
import showToast from '../../actions/toasts';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';

import ListView, { ListViewColumn, ListViewClickableLink } from '../list-view';
import ExploreAlertManagementModal, { COOLDOWN_CHOICES } from '../explore-alert-management-modal';

// modes for management sections
const DISPLAY = 'DISPLAY';
const EDIT = 'EDIT';

const COOLDOWN_CHOICES_MAP = COOLDOWN_CHOICES.reduce((current, next) => {
  current[next.id] = next.label;
  return current;
}, {});


const GeneralInfoSection = props => {

  const { user, onSubmitUserUpdate, setErrorText } = props;
  const [mode, setMode] = useState(DISPLAY);
  
  // this state is only used for editing the user info, not for display (display is always pulled from props)
  const [userFullName, setUserFullName] = useState(user.data.fullName || '');
  const [userPhoneNumber, setUserPhoneNumber] = useState(user.data.phoneNumber || '');

  const handleEditButtonClick = evt => {
    setMode(EDIT);
  }

  const handleCancelButtonClick = evt => {
    setUserFullName(user.data.fullName || '');
    setMode(DISPLAY);
  }

  const handleSaveButtonClick = evt => {
    onSubmitUserUpdate(userFullName, userPhoneNumber)
      .then(setMode(DISPLAY))
      .catch(err => setErrorText(err))
  }

  return (
    <div className={styles.accountPageSection}>
      <div className={styles.accountPageSectionHeader}>
        <div className={styles.accountPageSectionHeaderText}>General Info</div>

        {/* Edit / Cancel button */}
        {mode === DISPLAY && user.data && !user.data.isDemo ? (
          <Button onClick={handleEditButtonClick}>Edit</Button>
        ) : null}
        {mode === EDIT ? ([
          <Button
            variant="underline"
            onClick={handleCancelButtonClick}
          >Cancel</Button>,
          <Button
            type="primary"
            variant="filled"
            onClick={handleSaveButtonClick}
          >Save changes</Button>
        ]) : null}
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
                value={mode === DISPLAY ? user.data.fullName : userFullName}
                onChange={evt => setUserFullName(evt.target.value)}
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
              htmlFor="account-phone-number"
              label="Phone number"
              input={<PhoneInputBox
                type="text"
                placeholder="+1 888 555 1234"
                width="100%"
                value={mode === DISPLAY ? user.data.phoneNumber : userPhoneNumber}
                onChange={value => setUserPhoneNumber(value)}
                disabled={mode !== EDIT}
                id="account-phone-number"
              />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const PasswordSection = props => {

  const { onSubmitPassword } = props;

  const [mode, setMode] = useState(DISPLAY);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const PASSWORD_MIN_LENGTH = 8;

  // possible values for password validation status
  const VALID = 0
  const CURRENT_PASSWORD_REQUIRED = 1
  const PASSWORD_UNCHANGED = 2
  const NEW_PASSWORD_TOO_SHORT = 3
  const PASSWORD_CONFIRMATION_MISMATCH = 4

  const currentPasswordExists = currentPassword.length > 0;
  const passwordHasChanged = newPassword !== currentPassword;
  const newPasswordIsLongEnough = newPassword.length >= PASSWORD_MIN_LENGTH;
  const passwordConfirmationMatches = newPassword === newPasswordConfirm;

  let validationStatus = VALID;
  if (!currentPasswordExists) {
    validationStatus = CURRENT_PASSWORD_REQUIRED;
  } else if (!passwordHasChanged) {
    validationStatus = PASSWORD_UNCHANGED;
  } else if (!newPasswordIsLongEnough) {
    validationStatus = NEW_PASSWORD_TOO_SHORT;
  } else if (!passwordConfirmationMatches) {
    validationStatus = PASSWORD_CONFIRMATION_MISMATCH;
  }

  const handleSaveButtonClick = () => {
    return onSubmitPassword(currentPassword, newPassword)
      .then(() => setMode(DISPLAY))
      .catch(error => showToast({ text: error, type: 'danger' }));
  }

  const handleCancelButtonClick = evt => {
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setMode(DISPLAY);
  }

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
            
            {/* Trigger changing the password */}
            {mode === DISPLAY ? (
              <Button
                variant="underline"
                width="200px"
                onClick={evt => setMode(EDIT)}
              >Change password</Button>
            ) : null}

            {/* The form to change the password that is triggered. */}
            {mode === EDIT ? (
              <div className={styles.accountPageSectionPopoutFormContent}>
                <div className={styles.passwordForm}>
                  <div className={styles.passwordFormFieldContainer}>
                    <FormLabel
                      htmlFor="account-password-current"
                      label="Current password"
                      input={<InputBox
                        id="account-password-current"
                        type="password"
                        placeholder="Enter your current password"
                        width="100%"
                        value={currentPassword}
                        leftIcon={validationStatus === CURRENT_PASSWORD_REQUIRED ? (
                          <InputBoxInfo color={colors.brandDanger}>Field is required</InputBoxInfo>
                        ) : null}
                        onChange={evt => setCurrentPassword(evt.target.value)}
                      />}
                    />
                    
                  </div>
                  <div className={styles.passwordFormFieldContainer}>
                    <FormLabel
                      htmlFor="account-password-new"
                      label="New password"
                      input={<InputBox
                        id="account-password-new"
                        type="password"
                        autocomplete="new-password"
                        placeholder="Enter a new password"
                        width="100%"
                        value={newPassword}
                        leftIcon={validationStatus === NEW_PASSWORD_TOO_SHORT ? (
                          <InputBoxInfo color={colors.brandDanger}>Must be at least {PASSWORD_MIN_LENGTH} characters</InputBoxInfo>
                        ) : validationStatus === PASSWORD_UNCHANGED ? (
                          <InputBoxInfo color={colors.brandDanger}>Must be a new password</InputBoxInfo>
                        ) : null}
                        onChange={evt => setNewPassword(evt.target.value)}
                      />}
                    />
                  </div>
                  <div className={styles.passwordFormFieldContainer}>
                    <FormLabel
                      htmlFor="account-password-new-confirm"
                      label="Confirm new password"
                      input={<InputBox
                        id="account-password-new-confirm"
                        type="password"
                        autocomplete="new-password"
                        placeholder="Confirm your new password"
                        width="100%"
                        value={newPasswordConfirm}
                        leftIcon={validationStatus === PASSWORD_CONFIRMATION_MISMATCH ? (
                          <InputBoxInfo color={colors.brandDanger}>Password must match</InputBoxInfo>
                        ) : null}
                        onChange={evt => setNewPasswordConfirm(evt.target.value)}
                      />}
                    />
                  </div>

                  <div className={styles.passwordFormActions}>
                    <div className={styles.passwordFormAction}>
                      <Button
                        variant="underline"
                        onClick={handleCancelButtonClick}
                      >Cancel</Button>
                    </div>
                    <div className={styles.passwordFormAction}>
                    <Button
                      type="primary"
                      variant="filled"
                      disabled={validationStatus !== VALID}
                      onClick={handleSaveButtonClick}
                    >Change password</Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>    
      </div>
    </div>
  )
}

function AlertSection({
  alerts,
  spaces,
  onUpdateAlert,
  onShowModal,
}) {

  // Prepare the array of necessary data once, so columns can iterate quickly
  const alertData = alerts.data.map(alert => {
    const space = spaces.data.find(space => space.id === alert.spaceId) || {};
    return { ...alert, spaceName: space.name };
  });

  return <div className={styles.accountPageSection}>
    <div className={styles.accountPageSectionHeader}>
      <div className={styles.accountPageSectionHeaderText}>Alerts</div>
    </div>
    <div className={styles.accountPageSectionBody}>
      <div style={{padding: '0 24px'}}>
        <div className={styles.accountPageSubsectionHeader}>SMS</div>
        <ListView data={alertData}>
          <ListViewColumn
            title="Space"
            flexGrow={3}
            template={alert => (
              <ListViewClickableLink
                onClick={() => (
                  window.location.href = `#/spaces/explore/${alert.spaceId}/trends`
                )}
              >{alert.spaceName}</ListViewClickableLink>
            )}
          />
          <ListViewColumn
            title="Trigger"
            flexGrow={1}
            template={alert => {
              const greaterLessSymbol = alert.triggerType === 'greater_than' ? '>' : '<';
              return `Occupancy ${greaterLessSymbol} ${alert.triggerValue}`;
            }}
          />
          <ListViewColumn
            title="Frequency"
            flexGrow={1}
            template={alert => COOLDOWN_CHOICES_MAP[alert.cooldown]}
          />
          <ListViewColumn
            title="Enabled"
            template={alert => <Switch
              value={alert.enabled}
              onChange={e => onUpdateAlert({ ...alert, enabled: e.target.checked})}
            />}
          />
          <ListViewColumn
            template={alert => (
              <ListViewClickableLink
                onClick={() => (
                  onShowModal('MODAL_ALERT_MANAGEMENT', { alert: { meta: {}, ...alert } })
                )}
              ><span style={{paddingRight: 16}}>Edit</span></ListViewClickableLink>
            )}
          />
        </ListView>
      </div>
    </div>
  </div>;
}

export class Account extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  setErrorText = text => {
    this.setState({error: text});
  }

  render() {
    const {
      user,
      alerts,
      spaces,
      activeModal,
      onUpdateAlert,
      onShowModal,
      onSubmitPassword,
      onSubmitUserUpdate,
    } = this.props;

    const canChangePassword = user.data && !user.data.isDemo && !user.data.organization.forceSsoLogin;
    const canManageAlerts = user.data && user.data.role !== 'readonly';
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

              {/* If an alert management modal is visible, render it above the view */}
              {activeModal.name === 'MODAL_ALERT_MANAGEMENT' ? (
                <ExploreAlertManagementModal />
              ) : null}

              {/* GENERAL INFO */}
              <GeneralInfoSection
                user={user}
                onSubmitUserUpdate={onSubmitUserUpdate}
              />
              
              {/* PASSWORD */}
              {canChangePassword ? (
                <PasswordSection
                  onSubmitPassword={onSubmitPassword}
                  setErrorText={this.setErrorText}
                />
              ) : null}

              {/* ALERTS */}
              {canManageAlerts ? (
                <AlertSection
                  alerts={alerts}
                  spaces={spaces}
                  onUpdateAlert={onUpdateAlert}
                  onShowModal={onShowModal}
                />
              ) : null}
              
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
    alerts: state.alerts,
    spaces: state.spaces,
    activeModal: state.activeModal,
    loading: state.user.loading,
  };
}, dispatch => {
  return {
    async onUpdateAlert(alert) {
      await dispatch<any>(collectionAlertsUpdate(alert));
      dispatch<any>(showToast({
        text: alert.enabled ? 'Alert enabled' : 'Alert disabled',
        timeout: 1000
      }));
    },
    onShowModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onSubmitPassword(currentPassword, password) {
      return dispatch<any>(userResetPassword(currentPassword, password)).then(() => {
        dispatch<any>(showModal('account-password-reset'));
      });
    },
    onSubmitUserUpdate(fullName, phoneNumber) {
      return dispatch<any>(userUpdate(fullName, phoneNumber));
    },
    onHideSuccessToast() {
      dispatch<any>(hideModal());
    },
  };
})(Account);
