
import impersonateHeaderReducerEnhancer from '../../helpers/impersonate-header-reducer-enhancer';
import { IMPERSONATE_SET } from '../../actions/impersonate';

const defaultState = {
  enabled: false,
  organizations: [],
  selectedOrganization: null,
  users: [],
  selectedUser: null
};

const initialState = localStorage.impersonate ?
  JSON.parse(localStorage.impersonate) : defaultState;

export function impersonate(state=initialState, action) {
  switch (action.type) {
  case IMPERSONATE_SET:
    return action.data || defaultState;
  default:
    return state;
  }
}

export default impersonateHeaderReducerEnhancer(impersonate);
