
import impersonateHeaderReducerEnhancer from '../../helpers/impersonate-header-reducer-enhancer';
import { IMPERSONATE_SET } from '../../actions/impersonate';

const initialState = {
  enabled: false,
  organizations: [],
  selectedOrganization: null,
  users: [],
  selectedUser: null
};

export function impersonate(state=initialState, action) {
  switch (action.type) {
  case IMPERSONATE_SET:
    return action.data ? action.data : initialState;
  default:
    return state;
  }
}

export default impersonateHeaderReducerEnhancer(impersonate);
