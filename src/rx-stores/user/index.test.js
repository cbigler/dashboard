import assert from 'assert';
import { userReducer } from './index';

import userSet from '../../rx-actions/user/set';
import userPush from '../../rx-actions/user/push';
import userError from '../../rx-actions/user/error';

describe('user', () => {
  it('should fully update the user inside', () => {
    const output = userReducer(null, userSet({email: 'test@density.io'}));
    assert.deepEqual(output.data, {email: 'test@density.io'});
  });
  it('should apply a single field update to a user', () => {
    const output = userReducer({data: {foo: 'bar'}}, userPush({email: 'test@density.io'}));
    assert.deepEqual(output.data, {foo: 'bar', email: 'test@density.io'});
  });

  it('should fully update the user inside and reset loading state', () => {
    const output = userReducer({loading: true}, userSet({email: 'test@density.io'}));
    assert.deepEqual(output.loading, false);
  });
  it('should set the error attribute on a user', () => {
    const output = userReducer({error: null}, userError('Boom!'));
    assert.deepEqual(output.error, 'Boom!');
  });
});
