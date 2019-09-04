import { ReduxAction } from './redux';
import { AlertAction } from "./alerts";
import { UserAction } from "./users";
import { AnalyticsAction } from "./analytics";

export type GlobalAction = (
  ReduxAction |
  AlertAction |
  UserAction |
  AnalyticsAction
);

export type DispatchType = (action: GlobalAction) => void;
