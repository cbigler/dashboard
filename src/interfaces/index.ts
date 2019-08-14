import { AlertAction } from "./alerts";
import { UserAction } from "./users";

export type GlobalAction =
  AlertAction |
  UserAction |
  { type: 'foo', value: 'bar' };

export type DispatchType = (action: GlobalAction) => void;
