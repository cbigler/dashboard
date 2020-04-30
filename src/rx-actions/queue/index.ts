import * as moment from "moment";

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import { QueueSettings } from '../../rx-stores/queue';


export enum QueueActionTypes {
  ROUTE_TRANSITION_QUEUE_SPACE_DETAIL = 'ROUTE_TRANSITION_QUEUE_SPACE_DETAIL',
  QUEUE_WILL_UNMOUNT = 'QUEUE_WILL_UNMOUNT',
  QUEUE_DETAIL_DATA_LOADED = 'QUEUE_DETAIL_DATA_LOADED',
  QUEUE_SET_TALLY_ENABLED = 'QUEUE_SET_TALLY_ENABLED',
  QUEUE_CREATE_TALLY_EVENT = 'QUEUE_CREATE_TALLY_EVENT',
  QUEUE_WEBSOCKET_STATUS_CHANGE = 'QUEUE_WEBSOCKET_STATUS_CHANGE',
  QUEUE_WEBSOCKET_COUNT_CHANGE = 'QUEUE_WEBSOCKET_COUNT_CHANGE',
}

export enum QUEUE_SOCKET_CONNECTION_STATES {
  CLOSED = 'CLOSED',
  WAITING_FOR_SOCKET_URL = 'WAITING_FOR_SOCKET_URL',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
};

export type QueueAction =
  | {
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL;
    id: string;
  }
  | {
    type: QueueActionTypes.QUEUE_WILL_UNMOUNT;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_DATA_LOADED;
    space: CoreSpace;
    spaceEvents: CoreSpaceEvent[];
    spaceDwellMean: number;
    virtualSensorSerial: string;
    settings: QueueSettings;
  }
  | {
    type: QueueActionTypes.QUEUE_SET_TALLY_ENABLED;
    enabled: boolean;
  }
  | {
    type: QueueActionTypes.QUEUE_CREATE_TALLY_EVENT;
    timestamp: moment.Moment;
    trajectory: 1 | -1;
    virtualSensorSerial: string;
  }
  | {
    type: QueueActionTypes.QUEUE_WEBSOCKET_STATUS_CHANGE;
    state: QUEUE_SOCKET_CONNECTION_STATES;
  }
  | {
    type: QueueActionTypes.QUEUE_WEBSOCKET_COUNT_CHANGE;
    currentCount: number;
    newEvent: CoreSpaceEvent;
  }