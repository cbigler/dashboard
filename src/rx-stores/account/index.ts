import createRxStore, { skipUpdate } from '../index';
import { AccountState, AccountActionTypes } from '../../types/account';

const initialState = {
  passwordResetToken: null,
  invitationData: null,
};

const AccountStore = createRxStore<AccountState>('AccountForgotPasswordStore', initialState, (state, action) => {
  switch (action.type) {
  case AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD:
    return {
      ...state,
      passwordResetToken: action.payload
    };
  case AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_REGISTER:
    return {
      ...state,
      invitationData: action.payload
    }
  default:
    return skipUpdate;
  }
});

export default AccountStore;
