import { AnalyticsAction } from '../rx-actions/analytics';
import { ReduxAction } from './redux';
import { AlertAction } from './alerts';
import { UserAction } from '../rx-actions/user';
import { UserAction as UserManagementAction } from './users';
import { SessionTokenAction } from './session-token';
import { ImpersonateAction } from './impersonate';
import { AccountAction } from './account';
import { SpaceManagementAction } from '../rx-actions/space-management';

export type GlobalAction =
  | AccountAction
  | AlertAction
  | AnalyticsAction
  | ImpersonateAction
  | ReduxAction
  | SessionTokenAction
  | SpaceManagementAction
  | UserManagementAction
  | UserAction
;

export type DispatchType = (action: GlobalAction) => void;
