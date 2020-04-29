import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { QueueSettings } from '../../rx-stores/queue';

export enum QueueActionTypes {
  ROUTE_TRANSITION_QUEUE_SPACE_DETAIL = 'ROUTE_TRANSITION_QUEUE_SPACE_DETAIL',
  QUEUE_DETAIL_DATA_LOADED = 'QUEUE_DETAIL_DATA_LOADED'
}

export type QueueAction =
  | {
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL;
    id: string;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_DATA_LOADED;
    space: CoreSpace,
    spaceDwellMean: number,
    virtualSensorSerial: string,
    settings: QueueSettings
  }