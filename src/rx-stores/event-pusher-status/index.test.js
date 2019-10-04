import assert from 'assert';
import { eventPusherStatusReducer, initialState } from './index';

import eventPusherStatusChange from '../../rx-actions/event-pusher/status-change';

describe('eventPusherStatus', () => {
  it('should respond to a status update from the live event pusher implmentation', () => {
    const result = eventPusherStatusReducer(initialState, eventPusherStatusChange('MY_STATUS'));
    assert.deepEqual(result, {status: 'MY_STATUS'});
  });
  it('should default to status of "unknown"', () => {
    const result = eventPusherStatusReducer(initialState, {type: undefined});
    assert.deepEqual(result, {status: 'unknown'});
  });
});

