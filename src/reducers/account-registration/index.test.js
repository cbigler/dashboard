import assert from 'assert';
import accountRegistration from './index';

import { encode } from '../../helpers/url-safe-base64/index'
import routeTransitionAccountRegister from '../../actions/route-transition/account-register';

const REGISTRATION_DATA = {
  user: "email@example.com",
  invitation_token: "inv_XXXXXXXXXXXXXXXXXXXXXXXXXX",
};

describe('account-registration', function() {
  it('should store the account registration information in the store when it is empty', () => {
    const output = accountRegistration(
      null,
      routeTransitionAccountRegister(encode(REGISTRATION_DATA))
    );
    assert.deepEqual(output, REGISTRATION_DATA);
  });
});
