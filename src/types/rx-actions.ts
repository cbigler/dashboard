import { AnalyticsAction } from '../rx-actions/analytics';
import { ReduxAction } from './redux';
import { AlertAction } from './alerts';
import { UserAction } from './users';
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
  | UserAction
;

export type DispatchType = (action: GlobalAction) => void;
