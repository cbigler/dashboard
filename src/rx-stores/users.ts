import createRxStore from './index';

import { UserActionTypes, UserState } from '../interfaces/users';

const initialState: UserState = {
  view: 'LOADING',
  error: null,
  data: [],
  searchText: '',
  editor: {}
};

export default createRxStore<UserState>(initialState, (state, action) => {
  switch (action.type) {
    case UserActionTypes.USER_MANAGEMENT_USERS_LOAD:
    case UserActionTypes.USER_MANAGEMENT_USERS_LOAD_ONE:
      return {
        ...state,
        view: 'LOADING',
        error: null
      };
    case UserActionTypes.USER_MANAGEMENT_USERS_SET:
      return {
        ...state,
        data: action.users,
        view: 'VISIBLE',
        error: null
      };

    case UserActionTypes.USER_MANAGEMENT_USERS_PUSH:
      return {
        ...state,
        view: 'VISIBLE',
        data: [
          ...state.data.map(user => (
            action.user.id === user.id ? { ...user, ...action.user } : user
          )),
          ...state.data.find(user => user.id === action.user.id) ? [] : [action.user],
        ],
      };

    case UserActionTypes.USER_MANAGEMENT_USERS_REMOVE:
      return {
        ...state,
        view: 'VISIBLE',
        data: state.data.filter(user => action.user.id !== user.id)
      };

    case UserActionTypes.USER_MANAGEMENT_UPDATE_SEARCH:
      return {
        ...state,
        searchText: action.text,
      };

    case UserActionTypes.USER_MANAGEMENT_SET_EDITOR:
      return {
        ...state,
        editor: {
          data: action.user,
          role: action.user.role,
          spaceFilteringActive: (action.user.spaces || []).length > 0,
          spaceIds: action.user.spaces || [],
        }
      }

    case UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR:
      return {
        ...state,
        editor: {
          ...state.editor,
          ...action.state,
        },
      };

    case UserActionTypes.USER_MANAGEMENT_ERROR:
      return {
        ...state,
        view: 'ERROR',
        error: action.error
      };
  }
});
