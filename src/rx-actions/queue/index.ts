export enum QueueActionTypes {
  ROUTE_TRANSITION_QUEUE_SPACE_DETAIL = 'ROUTE_TRANSITION_QUEUE_SPACE_DETAIL'
}

export type QueueAction =
  | {
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL;
    id: string;
  }