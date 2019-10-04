export enum AccountActionTypes {
  ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD = 'ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD',
  ROUTE_TRANSITION_ACCOUNT_REGISTER = 'ROUTE_TRANSITION_ACCOUNT_REGISTER',
};

export type AccountAction = {
  type: AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD,
  payload: string,
} | {
  type: AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_REGISTER,
  payload: string,
};

export type AccountState = {
  passwordResetToken: string | null,
  invitationData: string | null,
};
