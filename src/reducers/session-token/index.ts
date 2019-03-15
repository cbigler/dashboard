import localStorageReducerEnhancer from '../../helpers/localstorage-reducer-enhancer/index';
import { SESSION_TOKEN_SET } from '../../actions/session-token/set';
import { SESSION_TOKEN_UNSET } from '../../actions/session-token/unset';

import { core, accounts, metrics } from '../../client';

const localStorage = window.localStorage || (global as any).localStorage || {};

// The initial state of the reducer is either the contents of the localStorage key `sessionToken` or
// null if no user is logged in.
const initialState = localStorage.sessionToken !== undefined ? JSON.parse(localStorage.sessionToken) : null;

export function sessionToken(state=initialState, action) {
  switch (action.type) {
  case SESSION_TOKEN_SET:
    return action.token;
  case SESSION_TOKEN_UNSET:
    return null;
  default:
    return state;
  }
}

// When a new session token is injected, update all the api clients with the token.
function updateTokenReducerEnhancer(reducer) {
  return (state, action) => {
    const token = reducer(state, action);
    updateTokensOnApiClients(token);
    return token;
  };
}

// This function serves as a way of updating every service or concept in the application that
// requires access to a token. This includes all the api clients and the websockets event source.
function updateTokensOnApiClients(token) {
  core.config({token}); // Core api service
  accounts.config({token}); // Accounts api service
  metrics.config({token});
}
updateTokensOnApiClients(initialState);

// Thinking "What's a reducer enhancer?" - here's a link to some redux docs:
// https://github.com/reactjs/redux/blob/master/docs/recipes/ImplementingUndoHistory.md#meet-reducer-enhancers
const ered = localStorageReducerEnhancer('sessionToken')(sessionToken);
export default updateTokenReducerEnhancer(ered);
