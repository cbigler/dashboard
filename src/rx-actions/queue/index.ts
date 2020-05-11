import * as moment from "moment";

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import { QueueSettings } from '../../rx-stores/queue';


export enum QueueActionTypes {
  ROUTE_TRANSITION_QUEUE_SPACE_LIST = 'ROUTE_TRANSITION_QUEUE_SPACE_LIST',
  QUEUE_LIST_DATA_LOAD_COMPLETE = 'QUEUE_LIST_DATA_LOAD_COMPLETE',
  QUEUE_LIST_DATA_LOAD_ERROR = 'QUEUE_LIST_DATA_LOAD_ERROR',
  QUEUE_LIST_CHANGE_SEARCH_TEXT = 'QUEUE_LIST_CHANGE_SEARCH_TEXT',

  ROUTE_TRANSITION_QUEUE_SPACE_DETAIL = 'ROUTE_TRANSITION_QUEUE_SPACE_DETAIL',
  QUEUE_DETAIL_WILL_UNMOUNT = 'QUEUE_DETAIL_WILL_UNMOUNT',
  QUEUE_DETAIL_DATA_LOADED = 'QUEUE_DETAIL_DATA_LOADED',
  QUEUE_DETAIL_SET_TALLY_ENABLED = 'QUEUE_DETAIL_SET_TALLY_ENABLED',
  QUEUE_DETAIL_CREATE_TALLY_EVENT = 'QUEUE_DETAIL_CREATE_TALLY_EVENT',
  QUEUE_DETAIL_WEBSOCKET_STATUS_CHANGE = 'QUEUE_DETAIL_WEBSOCKET_STATUS_CHANGE',
  QUEUE_DETAIL_WEBSOCKET_COUNT_CHANGE = 'QUEUE_DETAIL_WEBSOCKET_COUNT_CHANGE',
  QUEUE_DETAIL_SYNC_EVENTS = 'QUEUE_DETAIL_SYNC_EVENTS',
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
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_LIST;
  }
  | {
    type: QueueActionTypes.QUEUE_LIST_DATA_LOAD_COMPLETE,
    spaces: Array<CoreSpace>,
    orgSettings: {[id: string]: QueueSettings} | null,
    visibleSpaceIds: Array<CoreSpace['id']>,
  }
  | { type: QueueActionTypes.QUEUE_LIST_DATA_LOAD_ERROR, error: any }
  | { type: QueueActionTypes.QUEUE_LIST_CHANGE_SEARCH_TEXT, text: string }

  | {
    type: QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL;
    id: string;
    queryParams?: { [key: string]: any };
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_WILL_UNMOUNT;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_DATA_LOADED;
    space: CoreSpace;
    spaceEvents: CoreSpaceEvent[];
    spaceDwellMean: number;
    virtualSensorSerial: string;
    settings: QueueSettings;
    orgLogoURL: string;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_SET_TALLY_ENABLED;
    enabled: boolean;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_CREATE_TALLY_EVENT;
    timestamp: moment.Moment;
    trajectory: 1 | -1;
    virtualSensorSerial: string;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_WEBSOCKET_STATUS_CHANGE;
    state: QUEUE_SOCKET_CONNECTION_STATES;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_WEBSOCKET_COUNT_CHANGE;
    currentCount: number;
    newEvent: CoreSpaceEvent;
  }
  | {
    type: QueueActionTypes.QUEUE_DETAIL_SYNC_EVENTS;
    space: CoreSpace;
    spaceEvents: CoreSpaceEvent[];
  }
