
import impersonateReducerEnhancer from '../../helpers/impersonate-reducer-enhancer';
import { IMPERSONATE_SET, IMPERSONATE_UNSET } from '../../actions/impersonate';

export const defaultState = {
  enabled: false,
  loading: false,
  organizations: [],
  organizationFilter: null,
  selectedOrganization: null,
  users: [],
  userFilter: null,
  selectedUser: null
};

const initialState = localStorage.impersonate ? JSON.parse(localStorage.impersonate) : null;

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
  case IMPERSONATE_UNSET:
    return null;
  default:
    return state;
  }
}

export default impersonateReducerEnhancer(impersonate);
