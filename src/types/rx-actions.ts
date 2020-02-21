import { ReduxAction } from './redux';
import { AnalyticsAction } from '../rx-actions/analytics';
import { AlertAction } from './alerts';
import { UserAction } from './users';
import { SessionTokenAction } from './session-token';
import { ImpersonateAction } from './impersonate';
import { AccountAction } from './account';
import { DoorwayAction } from '../rx-actions/doorways';
import { SpaceAction } from '../rx-actions/spaces';
import { SpacesPageAction } from '../rx-actions/spaces-page';
import { SensorAction } from '../rx-actions/sensors';

export type GlobalAction =
  | ReduxAction
  | AlertAction
  | AnalyticsAction
  | UserAction
  | SessionTokenAction
  | ImpersonateAction
  | AccountAction
  | DoorwayAction
  | SensorAction
  | SpaceAction
  | SpacesPageAction
;

export type DispatchType = (action: GlobalAction) => void;
