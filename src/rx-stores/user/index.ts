import { USER_SET } from '../../rx-actions/user/set';
import { USER_PUSH } from '../../rx-actions/user/push';
import { USER_ERROR } from '../../rx-actions/user/error';
import { SESSION_TOKEN_UNSET } from '../../rx-actions/session-token/unset';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensityUser } from '../../types';
import createRxStore, { skipUpdate } from '..';


// FIXME: the typings here can't infer presence of DensityUser based on loading state
export type UserState = {
  data: DensityUser | null,
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
    return {...state, loading: false, data: objectSnakeToCamel<DensityUser>(action.data)};
  case USER_PUSH:
    return {
      ...state,
      loading: false,
      data: {
        ...(state.data as any),
        ...objectSnakeToCamel(action.item)
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