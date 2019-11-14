import { EVENT_PUSHER_STATUS_CHANGE } from '../../rx-actions/event-pusher/status-change';
import createRxStore from '..';

// FIXME: the valid status values should be in an enum
export type EventPusherStatusState = {
  status: string
}

export const initialState: EventPusherStatusState = {status: 'unknown'};

// FIXME: action should be GlobalAction
export function eventPusherStatusReducer(state: EventPusherStatusState, action: Any<FixInRefactor>): EventPusherStatusState {
  switch (action.type) {
  case EVENT_PUSHER_STATUS_CHANGE:
    return {status: action.status};
  default:
    return state;
  }
}

const EventPusherStatusStore = createRxStore('EventPusherStatusStore', initialState, eventPusherStatusReducer);
export default EventPusherStatusStore;
