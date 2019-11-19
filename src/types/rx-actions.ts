import { AnalyticsAction } from '../rx-actions/analytics';
import { ReduxAction } from './redux';
import { AlertAction } from './alerts';
import { UserAction } from './users';
import { SessionTokenAction } from './session-token';
import { ImpersonateAction } from './impersonate';
import { AccountAction } from './account';

export type GlobalAction =
  | AccountAction
  | AlertAction
  | AnalyticsAction
  | ImpersonateAction
  | ReduxAction
  | SessionTokenAction
  | UserAction
;

export type DispatchType = (action: GlobalAction) => void;
