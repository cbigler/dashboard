import { useEffect } from 'react';

import { CoreUser } from '@density/lib-api-types/core-v2/users';

import accounts from '../../client/accounts';
import unsafeNavigateToLandingPage from '../../helpers/unsafe-navigate-to-landing-page/index';

import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import redirectAfterLogin from '../../rx-actions/miscellaneous/redirect-after-login';

const Login: React.FunctionComponent = () => {
  const dispatch = useRxDispatch();

  const user = useRxStore(UserStore);
  const isLoggedIn = user.data !== null;

  const miscellaneous = useRxStore(MiscellaneousStore);
  const redirectAfterLoginState: Any<FixInRefactor> = miscellaneous.redirectAfterLogin;

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isLoggedIn) {
      // When already logged in, then redirect right away to the app
      unsafeNavigateToLandingPage(
        (user.data as CoreUser).organization.settings,
        redirectAfterLoginState,
      );
      dispatch(redirectAfterLogin(null) as Any<FixInRefactor>);
    } else {
      // User needs to login - redirect to the auth0 process
      const redirectUrl = `${window.location.origin}#access_token=%TOKEN%`;
      const baseUrl = accounts().defaults.baseURL;
      window.location.href = `${baseUrl}/app/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
    }
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return null;
}

export default Login;
