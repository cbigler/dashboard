
import { switchMap, take, filter } from 'rxjs/operators';
import createRxStore, { actions, skipUpdate } from '..';
import { ImpersonateActionTypes } from '../../types/impersonate';

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

const ImpersonateStore = createRxStore('ImpersonateStore', initialState, (state, action) => {
  switch (action.type) {
  case ImpersonateActionTypes.IMPERSONATE_SET:
    return action.data && action.data.enabled ? {
      ...defaultState,
      enabled: true,
      organizations: action.data.organizations,
      selectedOrganization: action.data.selectedOrganization,
      users: action.data.users,
      selectedUser: action.data.selectedUser
    } : defaultState;
  case ImpersonateActionTypes.IMPERSONATE_UNSET:
    return null;
  default:
    return skipUpdate;
  }
});
export default ImpersonateStore;

// FIXME(RX): how to get this lag/previous value in RxJS?
let lastState = JSON.parse(JSON.stringify(localStorage.impersonate || defaultState));

// When a new session token is set, update all the api clients with the token.
actions.pipe(
  filter(action => {
    switch(action.type) {
      case ImpersonateActionTypes.IMPERSONATE_SET:
        return true;
      case ImpersonateActionTypes.IMPERSONATE_UNSET:
        return true;
      default:
        return false;
    }
  }),
  switchMap(
    () => ImpersonateStore.pipe(take(1)),
    (action, state) => [action, state]
  ),
).subscribe(([action, state]) => {
  const shouldReload = state && lastState && state.selectedUser !== lastState.selectedUser;
  lastState = JSON.parse(JSON.stringify(state));
  console.log(state, lastState);
  if (action.type === ImpersonateActionTypes.IMPERSONATE_UNSET) {
    delete localStorage.impersonate;
  }
  
  if (shouldReload) {
    if (state.selectedUser) {
      localStorage['impersonate'] = JSON.stringify(state);
    } else {
      delete localStorage['impersonate'];
    }
    window.location.hash = '/';
    window.location.reload();
  }
});
