import { DensityNotification } from ".";


// Alert (DensityNotification) Actions

export enum AlertActionTypes {
  COLLECTION_ALERTS_LOAD = 'COLLECTION_ALERTS_LOAD',
  COLLECTION_ALERTS_SET = 'COLLECTION_ALERTS_SET',
  COLLECTION_ALERTS_PUSH = 'COLLECTION_ALERTS_PUSH',
  COLLECTION_ALERTS_REMOVE = 'COLLECTION_ALERTS_REMOVE',
  COLLECTION_ALERTS_ERROR = 'COLLECTION_ALERTS_ERROR',
};

export type AlertAction = {
  type: AlertActionTypes.COLLECTION_ALERTS_LOAD,
} | {
  type: AlertActionTypes.COLLECTION_ALERTS_SET,
  alerts: Array<DensityNotification>,
} | {
  type: AlertActionTypes.COLLECTION_ALERTS_PUSH,
  alert: DensityNotification,
} | {
  type: AlertActionTypes.COLLECTION_ALERTS_REMOVE,
  alert: DensityNotification,
} | {
  type: AlertActionTypes.COLLECTION_ALERTS_ERROR,
  error: any,
};


// Alert (DensityNotification) store state

export interface AlertState {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  selected: DensityNotification | null,
  error: any,
  data: Array<DensityNotification>
}
