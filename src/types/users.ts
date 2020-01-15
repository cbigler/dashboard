import { CoreUser } from '@density/lib-api-types/core-v2/users';


export enum UserActionTypes {
  USER_MANAGEMENT_USERS_LOAD = 'USER_MANAGEMENT_USERS_LOAD',
  USER_MANAGEMENT_USERS_LOAD_ONE = 'USER_MANAGEMENT_USERS_LOAD_ONE',
  USER_MANAGEMENT_USERS_SET = 'USER_MANAGEMENT_USERS_SET',
  USER_MANAGEMENT_USERS_PUSH = 'USER_MANAGEMENT_USERS_PUSH',
  USER_MANAGEMENT_USERS_REMOVE = 'USER_MANAGEMENT_USERS_REMOVE',
  USER_MANAGEMENT_USERS_INVITE_RESEND = 'USER_MANAGEMENT_USERS_INVITE_RESEND',
  USER_MANAGEMENT_USERS_CREATE = 'USER_MANAGEMENT_USERS_CREATE',

  USER_MANAGEMENT_UPDATE_SEARCH = 'USER_MANAGEMENT_UPDATE_SEARCH',
  USER_MANAGEMENT_UPDATE_EDITOR = 'USER_MANAGEMENT_UPDATE_EDITOR',
  USER_MANAGEMENT_SET_EDITOR = 'USER_MANAGEMENT_SET_EDITOR',
  USER_MANAGEMENT_ERROR = 'USER_MANAGEMENT_ERROR',
};

export type UserAction = (
  { type: UserActionTypes.USER_MANAGEMENT_USERS_LOAD } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_LOAD_ONE, id } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_SET, users: Array<CoreUser> } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH, user: CoreUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_REMOVE, user: CoreUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_INVITE_RESEND, user: CoreUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_CREATE, user: CoreUser } |

  { type: UserActionTypes.USER_MANAGEMENT_ERROR, error: Error } |
  { type: UserActionTypes.USER_MANAGEMENT_UPDATE_SEARCH, text: string } |
  { type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR, state: UserEditorState } |
  { type: UserActionTypes.USER_MANAGEMENT_SET_EDITOR, user: CoreUser }
);


export interface UserEditorState {
  data?: CoreUser,
  role?: string,
  spaceFilteringActive?: boolean,
  space_ids?: Array<string>,
}

export interface UserState {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  error: Error | null,
  data: Array<CoreUser>,
  searchText: string,
  editor: UserEditorState,
}
