import assert from 'assert';
import sinon from 'sinon';
import setSettingsFlagConstructor from './index';

describe('set-settings-flag', function() {
  it('should work', function() {
    const store = {
      getState: sinon.stub().returns({
        user: {
          data: {
            id: `usr_123`,
            full_name: `John Smith`,
            email: `foo@example.com`,
            organization: {
              id: `org_456`,
              settings: {},
            },
          },
        },
      }),
      dispatch: sinon.spy(),
    };

    // Update a setting, and ensure that an action is dispatched.
    const setSettingsFlag = setSettingsFlagConstructor(store);
    setSettingsFlag('key', 'value');

    // Verify an action has been dispatched.
    assert.equal(store.dispatch.callCount, 1);

    // Verify that the action contains the new key/value setting pair that is expected.
    assert.deepEqual(store.dispatch.firstCall.args[0], {
      type: 'USER_PUSH',
      item: {
        id: `usr_123`,
        full_name: `John Smith`,
        email: `foo@example.com`,
        organization: {
          id: `org_456`,
          settings: {
            key: 'value', /* New setting is here */
          },
        },
      },
    });
  });
  it(`should not work if the reducer hasn't loaded its data yet`, function() {
    const store = {
      getState: sinon.stub().returns({
        user: {
          data: null, /* no user data loaded yet */
        },
      }),
      dispatch: sinon.spy(),
    };

    // Update a setting, and verify that the helper fails with an error.
    const setSettingsFlag = setSettingsFlagConstructor(store);
    assert.throws(() => {
      setSettingsFlag('key', 'value');
    }, new Error('Please wait for the user collection to load before changing settings flags.'));
  });
});
