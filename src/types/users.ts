import { DensityUser } from ".";


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
  { type: UserActionTypes.USER_MANAGEMENT_USERS_SET, users: Array<DensityUser> } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_PUSH, user: DensityUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_REMOVE, user: DensityUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_INVITE_RESEND, user: DensityUser } |
  { type: UserActionTypes.USER_MANAGEMENT_USERS_CREATE, user: DensityUser } |

  { type: UserActionTypes.USER_MANAGEMENT_ERROR, error: Error } |
  { type: UserActionTypes.USER_MANAGEMENT_UPDATE_SEARCH, text: string } |
  { type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR, state: UserEditorState } |
  { type: UserActionTypes.USER_MANAGEMENT_SET_EDITOR, user: DensityUser }
);


export interface UserEditorState {
  data?: DensityUser,
  role?: string,
  spaceFilteringActive?: boolean,
  spaceIds?: Array<string>,
}

export interface UserState {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  error: Error | null,
  data: Array<DensityUser>,
  searchText: string,
  editor: UserEditorState,
}
