import { decode } from '../../helpers/url-safe-base64/index'
import { AccountActionTypes } from "../../types/account";

export default function routeTransitionAccountRegister(slug) {
  return {
    type: AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_REGISTER,
    payload: decode(slug),
  };
}
