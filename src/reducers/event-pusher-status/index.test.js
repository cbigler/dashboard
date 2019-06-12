import assert from 'assert';
import eventPusherStatus from './index';

import eventPusherStatusChange from '../../actions/event-pusher/status-change';

describe('eventPusherStatus', function() {
  it('should respond to a status update from the live event pusher implmentation', () => {
    const result = eventPusherStatus(undefined, eventPusherStatusChange('MY_STATUS'));
    assert.deepEqual(result, {status: 'MY_STATUS'});
  });
  it('should default to status of "unknown"', () => {
    const result = eventPusherStatus(undefined, {type: undefined});
    assert.deepEqual(result, {status: 'unknown'});
  });
});

