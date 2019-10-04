import { AccountActionTypes } from "../../types/account";

export default function routeTransitionAccountForgotPassword(resetToken) {
  return {
    type: AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD,
    payload: resetToken,
  };
}
