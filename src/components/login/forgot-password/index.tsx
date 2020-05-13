import React from 'react';
import classnames from 'classnames';

import { CoreUser } from '@density/lib-api-types/core-v2/users';

import {
  Button,
  CardLoading,
  Icons,
  Toast,
  ToastContext,
} from '@density/ui/src';
import colors from '@density/ui/variables/colors.json';

import accounts from '../../../client/accounts';
import { impersonateUnset } from '../../../rx-actions/impersonate';
import sessionTokenSet from '../../../rx-actions/session-token/set';
import unsafeNavigateToLandingPage from '../../../helpers/unsafe-navigate-to-landing-page/index';

import { InputStackItem } from '../../input-stack/index';

import logoDensityBlack from '../../../assets/images/logo-black.svg';

import styles from './styles.module.scss';
import useRxStore from '../../../helpers/use-rx-store';
import UserStore from '../../../rx-stores/user';
import MiscellaneousStore from '../../../rx-stores/miscellaneous';
import useRxDispatch from '../../../helpers/use-rx-dispatch';
import redirectAfterLogin from '../../../rx-actions/miscellaneous/redirect-after-login';


export class Login extends React.Component<any, any> {
    // // If we were just at the forgot password page, then show a popup to the user telling them
    // // that their password reset was successful.
    // referredFromForgotPassword: window.localStorage && window.localStorage.referredFromForgotPassword === 'true',
    // // Also, unset that forgot password referer flag now that it has been noted into the state of
    // // the login page component (on future page loads, the forgot password page is no longer the
    // // referrer)
    // if (window.localStorage && window.localStorage.referredFromForgotPassword) {
    //   delete window.localStorage.referredFromForgotPassword;
    // }

  state = {
    email: '',

    loading: false,
    error: null,
    errorTitle: '',

    forgotPasswordConfirmation: null,
    referredFromForgotPassword: false,
  }

  isFormValid = () => {
    return this.state.email.indexOf('@') >= 0 && !this.state.loading;
  }

  onEnter = e => {
    if (e.key === 'Enter') {
      if (this.isFormValid()) {
        this.onForgotPassword();
      }
    }
  }

  onForgotPassword = () => {
    this.setState({loading: true, error: null});
    return accounts().put('/users/password/forgot', {
      email: this.state.email,
    }).then(resp => {
      this.setState({loading: false, error: null, forgotPasswordConfirmation: resp.data.message});
    }).catch(error => {
      this.setState({loading: false, error});
    });
  }

  render() {
    return <div className={styles.loginView}>
      { this.state.loading ? <CardLoading indeterminate={true} /> : null }

      <div className={styles.loginSection}>
        {/* Render a toast if the password reset request worked */}
        {this.state.forgotPasswordConfirmation ? <div className={styles.loginToast}>
          <ToastContext.Provider value="MULTILINE">
            <Toast
              visible
              icon={<Icons.Check color={colors.white} />}
              onDismiss={() => this.setState({forgotPasswordConfirmation: null})}
            >
              {this.state.forgotPasswordConfirmation}
            </Toast>
          </ToastContext.Provider>
        </div> : null}

        {/* Render a toast if the password reset process was successful */}
        {this.state.referredFromForgotPassword ? (
          <div className={classnames(styles.loginToast, styles.loginToastForgotPassword)}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                visible
                icon={<Icons.No color={colors.white} />}
                onDismiss={() => this.setState({referredFromForgotPassword: false})}
              >
                Password reset successful, log in using your new credentials.
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        {this.props.user && this.props.user.error ? (
          <div className={classnames(styles.loginToast, styles.loginToastForgotPassword)}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                type="error"
                visible
                title="Error fetching user"
                icon={<Icons.No color={colors.white} />}
              >
                {this.props.user.error}
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        {/* Render any errors with previous login attempts */}
        {this.state.error ? (
          <div className={styles.loginToast}>
            <ToastContext.Provider value="MULTILINE">
              <Toast
                type="error"
                visible
                title={this.state.errorTitle || 'Incorrect password'}
                icon={<Icons.No color={colors.white} />}
                onDismiss={() => this.setState({error: null})}
              >
                <span>{this.state.error ? (this as any).state.error.message || this.state.error : null}</span>
              </Toast>
            </ToastContext.Provider>
          </div>
        ) : null}

        <div className={styles.loginDensityLogo}>
          <img src={logoDensityBlack} alt="Density Logo" />
        </div>

        <p className={styles.loginLead}>
          Reset the password to your Density account.
        </p>

        {/* Login inputs */}
        <div className={classnames(styles.loginFormContainer, styles.loginFormReset)}>
          <p className={styles.loginFormResetHeader}>We'll send a recovery link to:</p>
          <div className={styles.formControl}>
            <InputStackItem
              type="email"
              placeholder="Email Address"
              invalid={this.state.email.length > 0 && this.state.email.indexOf('@') === -1}
              onChange={e => this.setState({email: e.target.value, error: null})}
              onKeyPress={this.onEnter}
              value={this.state.email}
            />
          </div>

          {/* Submit the form! */}
          <div className={classnames(styles.loginSubmitButton, styles.email, {[styles.loading]: this.state.loading})}>
            <Button
              onClick={this.onForgotPassword}
              disabled={!this.isFormValid()}
              variant="filled"
            >Send Request</Button>
          </div>

          {/* Move to back to login page */}
          <div
            className={styles.loginActionSecondary}
            onClick={() => window.history.back()}
          ><Icons.ArrowLeft /> Back to login</div>
        </div>

        <p className={styles.loginTermsAndPrivacy}>
          <a href="https://www.density.io/privacy-policy/" target="_blank" rel="noopener noreferrer"> Privacy Policy</a>{' '}
          and <a href="https://www.density.io/terms-of-sale/" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
        </p>
      </div>
      {/* Login Section */}
    </div>;
  }
}


const ConnectedLogin: React.FunctionComponent = () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const miscellaneous = useRxStore(MiscellaneousStore);

  const redirectAfterLoginState: Any<FixInRefactor> = miscellaneous.redirectAfterLogin;

  const onUserSuccessfullyLoggedIn = (token, redirect) => {
    dispatch(impersonateUnset());
    sessionTokenSet(dispatch, token).then(data => {
      unsafeNavigateToLandingPage((data as CoreUser).organization.settings, redirect);
      dispatch(redirectAfterLogin(null) as Any<FixInRefactor>);
    });
  };

  return (
    <Login
      user={user}
      redirectAfterLogin={redirectAfterLoginState}
      onUserSuccessfullyLoggedIn={onUserSuccessfullyLoggedIn}
    />
  )
}

export default ConnectedLogin;
