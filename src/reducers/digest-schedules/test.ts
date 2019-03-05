import assert from 'assert';
import digestSchedule from './index';

import digestScheduleSet from '../../actions/collection/digest-schedules/set';
import digestScheduleError from '../../actions/collection/digest-schedules/error';
import digestSchedulePush from '../../actions/collection/digest-schedules/push';
import digestScheduleRemove from '../../actions/collection/digest-schedules/remove';

const INITIAL_STATE = digestSchedule(undefined, {});

const EXAMPLE_DIGEST_SCHEDULE = {
  id: 'dig_123',
  name: 'My digest',
  dashboardId: 'das_456',
  dayNumber: 1,
  daysOfWeek: ['Monday', 'Thursday'],
  frequency: 'weekly',
  recipients: [],
  time: '05:00:00',
  timeZone: 'America/New_York',
};

const EXAMPLE_DIGEST_SCHEDULE_2 = {
  id: 'dig_098',
  name: 'My digest number two',
  dashboardId: 'das_456',
  dayNumber: 1,
  daysOfWeek: ['Monday', 'Wednesday'],
  frequency: 'weekly',
  recipients: [],
  time: '05:00:00',
  timeZone: 'America/New_York',
};

describe('digest-schedules', function() {
  it('should start in a loading state', function() {
    assert.strictEqual(INITIAL_STATE.view, 'LOADING');
  });
  it('should set all data when set collection action is sent', function() {
    const state = digestSchedule(INITIAL_STATE, digestScheduleSet([EXAMPLE_DIGEST_SCHEDULE]));
    assert.strictEqual(state.view, 'VISIBLE');
    assert.deepStrictEqual(state.data, [EXAMPLE_DIGEST_SCHEDULE]);
  });
  it('should store error when an error action is sent', function() {
    const state = digestSchedule(INITIAL_STATE, digestScheduleError(new Error('Example error')));
    assert.strictEqual(state.view, 'ERROR');
    assert.strictEqual(state.error, 'Example error');
  });
  it('should be able to push a new dispatch schedule', function() {
    const stateWithOneDigest = digestSchedule(
      INITIAL_STATE,
      digestScheduleSet([EXAMPLE_DIGEST_SCHEDULE]),
    );
    const state = digestSchedule(
      stateWithOneDigest,
      digestSchedulePush(EXAMPLE_DIGEST_SCHEDULE_2),
    );
    assert.strictEqual(state.view, 'VISIBLE');
    assert.deepStrictEqual(state.data, [EXAMPLE_DIGEST_SCHEDULE, EXAMPLE_DIGEST_SCHEDULE_2]);
  });
  it('should be able to remove a digest schedule', function() {
    const stateWithOneDigest = digestSchedule(
      INITIAL_STATE,
      digestScheduleSet([EXAMPLE_DIGEST_SCHEDULE]),
    );
    const state = digestSchedule(
      stateWithOneDigest,
      digestSchedulePush(EXAMPLE_DIGEST_SCHEDULE_2),
    );
    assert.strictEqual(state.view, 'VISIBLE');
    assert.deepStrictEqual(state.data, [EXAMPLE_DIGEST_SCHEDULE, EXAMPLE_DIGEST_SCHEDULE_2]);
  });
});
