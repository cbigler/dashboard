import redirectAfterLogin from '../actions/miscellaneous/redirect-after-login';
import sessionTokenUnset from '../actions/session-token/unset';
import userError from '../actions/user/error';

export function errorHandler(error, store) {
  if (error.response) {
    // If the user received a 403 with a body of 'invalid authentication credentials' in response to
    // any request, send them to the login page.  Redirect the user to the login page and remove the
    // bad session token from the reducer.
    if (error.response.status === 403 && error.response.data.detail === 'Incorrect authentication credentials.') {
      store.dispatch(userError(`Login session has expired or is invalid. Please login again.`));
      store.dispatch(sessionTokenUnset());
      store.dispatch(redirectAfterLogin(window.location.hash));
      window.location.hash = '#/login';
    }
    return Promise.reject(error.response.data);
  } else {
    return Promise.reject(error);
  }
}
