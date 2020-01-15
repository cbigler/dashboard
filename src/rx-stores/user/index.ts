import { USER_SET } from '../../rx-actions/user/set';
import { USER_PUSH } from '../../rx-actions/user/push';
import { USER_ERROR } from '../../rx-actions/user/error';
import { SESSION_TOKEN_UNSET } from '../../rx-actions/session-token/unset';


import { CoreUser } from '@density/lib-api-types/core-v2/users';
import createRxStore, { skipUpdate } from '..';
import registerSideEffects from './effects';


// FIXME: the typings here can't infer presence of CoreUser based on loading state
export type UserState = {
  data: CoreUser | null,
  loading: boolean,
  error: unknown,
}

export const initialState: UserState = {
  data: null,
  loading: true,
  error: false,
} as const;

// FIXME: UserActions need to be defined and added to GlobalAction
export function userReducer(state: UserState, action: Any<FixInRefactor>) {
  switch (action.type) {
  case USER_SET:
    return {...state, loading: false, data: action.data as CoreUser};
  case USER_PUSH:
    return {
      ...state,
      loading: false,
      data: {
        ...(state.data as any),
        ...action.item as CoreUser
      },
    };
  case USER_ERROR:
    return {...state, loading: false, error: action.error};
  case SESSION_TOKEN_UNSET:
    return {...state, loading: false, data: null, error: null};
  default:
    return skipUpdate;
  }
}

const UserStore = createRxStore('UserStore', initialState, userReducer);
export default UserStore;

registerSideEffects(UserStore);
