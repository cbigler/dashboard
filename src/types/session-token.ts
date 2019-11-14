export enum SessionTokenActionTypes {
  SESSION_TOKEN_SET = 'SESSION_TOKEN_SET',
  SESSION_TOKEN_UNSET = 'SESSION_TOKEN_UNSET',
};

export type SessionTokenAction = {
  type: SessionTokenActionTypes.SESSION_TOKEN_SET,
  token: string,
} | {
  type: SessionTokenActionTypes.SESSION_TOKEN_UNSET,
};

export type SessionTokenState = string | null;
