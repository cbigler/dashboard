import {
  take,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';
import { SessionTokenActionTypes, SessionTokenState } from '../../types/session-token';
import { configureClients } from '../../helpers/unsafe-configure-app';
import createRxStore, { actions, rxDispatch, skipUpdate } from '..';

const localStorage = window.localStorage || (global as any).localStorage || {};

// The initial state of the reducer is either the contents of the localStorage key `sessionToken` or
// null if no user is logged in.
const initialState: SessionTokenState = localStorage.sessionToken !== undefined ?
  JSON.parse(localStorage.sessionToken) : null;

// Nothing actually reads this value directly from the store, but it might some day
const SessionTokenStore = createRxStore<SessionTokenState>('SessionTokenStore', initialState, (state, action) => {
  switch (action.type) {
    case SessionTokenActionTypes.SESSION_TOKEN_SET:
      return action.token;
    case SessionTokenActionTypes.SESSION_TOKEN_UNSET:
      return null;
    default:
      return skipUpdate;
  }
});
export default SessionTokenStore;

// When a new session token is set, update all the api clients with the token.
actions.pipe(
  switchMap(() => SessionTokenStore.pipe(take(1))),
  distinctUntilChanged(),
).subscribe(state => {
  localStorage.sessionToken = JSON.stringify(state);
  configureClients(rxDispatch);
});
