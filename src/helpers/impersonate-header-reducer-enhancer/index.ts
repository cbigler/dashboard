import axios from 'axios';
import { config as configCore } from '../../client/core';
import { config as configAccounts } from '../../client/accounts';

export default function impersonateHeaderReducerEnhancer(reducer) {
  return (state, props) => {
    const result = reducer(state, props);
    if (result && result.selectedUser) {
      configCore({impersonateUser: result.selectedUser});
      configAccounts({impersonateUser: result.selectedUser});
    } else {
      configCore({impersonateUser: undefined});
      configAccounts({impersonateUser: undefined});
    }
    return result;
  };
}
