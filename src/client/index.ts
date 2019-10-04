import getBackendErrorDetail from '../helpers/get-backend-error-detail';
import sessionTokenUnset from '../rx-actions/session-token/unset';
import userError from '../rx-actions/user/error';
import login from '../rx-actions/route-transition/login';

export function errorHandler(dispatch, error) {
  // If the user received a 403 with a body of 'invalid authentication credentials' in response to
  // any request, send them to the login page.  Redirect the user to the login page and remove the
  // bad session token from the reducer.
  if (
    error.response &&
    error.response.status === 403 &&
    getBackendErrorDetail(error) === 'Incorrect authentication credentials.'
  ) {
    dispatch(userError(`Login session has expired or is invalid. Please login again.`));
    dispatch(sessionTokenUnset());
    dispatch(login(window.location.hash));
    window.location.hash = '#/login';
  }
  return Promise.reject(error);
}
