
import impersonateHeaderReducerEnhancer from '../../helpers/impersonate-header-reducer-enhancer';
import { IMPERSONATE_SET } from '../../actions/impersonate';

const defaultState = {
  enabled: false,
  loading: false,
  organizations: [],
  organizationFilter: null,
  selectedOrganization: null,
  users: [],
  userFilter: null,
  selectedUser: null
};

const initialState = localStorage.impersonate ?
  JSON.parse(localStorage.impersonate) : defaultState;

export function impersonate(state=initialState, action) {
  switch (action.type) {
  case IMPERSONATE_SET:
    return action.data && action.data.enabled ? {
      ...defaultState,
      enabled: true,
      organizations: action.data.organizations,
      selectedOrganization: action.data.selectedOrganization,
      users: action.data.users,
      selectedUser: action.data.selectedUser
    } : defaultState;
  default:
    return state;
  }
}

export default impersonateHeaderReducerEnhancer(impersonate);
