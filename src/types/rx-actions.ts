import { AlertAction } from "./alerts";
import { UserAction } from "./users";
import { AnalyticsAction } from "./analytics";

export type GlobalAction = (
  AlertAction |
  UserAction |
  AnalyticsAction
);

export type DispatchType = (action: GlobalAction) => void;
