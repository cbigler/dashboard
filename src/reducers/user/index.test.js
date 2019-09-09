import assert from 'assert';
import user from './index';

import userSet from '../../actions/user/set';
import userPush from '../../actions/user/push';
import userError from '../../actions/user/error';

describe('user', function() {
  it('should fully update the user inside', function() {
    const output = user(null, userSet({email: 'test@density.io'}));
    assert.deepEqual(output.data, {email: 'test@density.io'});
  });
  it('should apply a single field update to a user', function() {
    const output = user({data: {foo: 'bar'}}, userPush({email: 'test@density.io'}));
    assert.deepEqual(output.data, {foo: 'bar', email: 'test@density.io'});
  });

  it('should fully update the user inside and reset loading state', function() {
    const output = user({loading: true}, userSet({email: 'test@density.io'}));
    assert.deepEqual(output.loading, false);
  });
  it('should set the error attribute on a user', function() {
    const output = user({error: null}, userError('Boom!'));
    assert.deepEqual(output.error, 'Boom!');
  });
});
