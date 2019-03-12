
import { IMPERSONATE_SET } from '../../actions/impersonate';

const initialState = {
  enabled: false,
  organizations: [],
  selectedOrganization: null,
  users: [],
  selectedUser: null
};

export default function impersonate(state=initialState, action) {
  switch (action.type) {
  case IMPERSONATE_SET:
    return action.data ? action.data : initialState;
  default:
    return state;
  }
}
