import { ReduxAction } from './redux';
import { AlertAction } from "./alerts";
import { UserAction } from "./users";
import { AnalyticsAction } from "./analytics";
import { SessionTokenAction } from "./session-token";
import { ImpersonateAction } from './impersonate';
import { AccountAction } from './account';

export type GlobalAction = (
  ReduxAction |
  AlertAction |
  UserAction |
  AnalyticsAction |
  SessionTokenAction |
  ImpersonateAction |
  AccountAction
);

export type DispatchType = (action: GlobalAction) => void;
