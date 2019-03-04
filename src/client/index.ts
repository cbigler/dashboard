import clientele from '@density/clientele';

import redirectAfterLogin from '../actions/miscellaneous/redirect-after-login';
import sessionTokenUnset from '../actions/session-token/unset';
import userError from '../actions/user/error';
import { getGoSlow } from '../components/environment-switcher/index';

let store;
function setStore(s) { store = s; }

async function errorHandler(response) {
  try {
    const data = await response.json();

    // If the user received a 403 with a body of 'invalid authentication credentials' in response to
    // any request, send them to the login page.  Redirect the user to the login page and remove the
    // bad session token from the reducer.
    if (response.status === 403 && data.detail === 'Incorrect authentication credentials.') {
      store.dispatch(userError(`Login session has expired or is invalid. Please login again.`));
      store.dispatch(sessionTokenUnset());
      store.dispatch(redirectAfterLogin(window.location.hash));
      window.location.hash = '#/login';
    }

    // If the response wasn't a 403, then return the best representation of the error.
    return data.detail || data.error || JSON.stringify(data);
  } catch (err) {
    // Handle requests that don't contain json.
    const text = await response.text();
    return text;
  }
}

const core = clientele({...require('./specs/core-api'), errorFormatter: errorHandler});
const accounts = clientele({...require('./specs/accounts-api'), errorFormatter: errorHandler});
const metrics = clientele({...require('./specs/metrics-api'), errorFormatter: errorHandler});

const defaultCounts = core.spaces.counts;
core.spaces.counts = function(data) {
  data.slow = getGoSlow() ? 'true' : undefined;
  return defaultCounts(data);
};

const defaultAllCounts = core.spaces.allCounts;
core.spaces.allCounts = function(data) {
  data.slow = getGoSlow() ? 'true' : undefined;
  return defaultAllCounts(data);
};

core.doorways.create = function(data) {
  return fetch(`${core.config().core}/doorways?environment=True`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${core.config().token}`,
    },
    body: JSON.stringify(data),
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};

core.doorways.update = function(data) {
  return fetch(`${core.config().core}/doorways/${data.id}?environment=True`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${core.config().token}`,
    },
    body: JSON.stringify(data),
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};

accounts.users.register = (data) => {
  return fetch(`${accounts.config().host}/users/register/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};

accounts.tokens.auth0_exchange = (token) => {
  return fetch(`${accounts.config().host}/tokens/exchange/auth0/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `JWT ${token}`
    },
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};

core.digest_schedules.create = (data) => {
  return fetch(`${core.config().core}/digest_schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${core.config().token}`,
    },
    body: JSON.stringify(data),
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};

core.digest_schedules.update = ({id, ...data}) => {
  return fetch(`${core.config().core}/digest_schedules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${core.config().token}`,
    },
    body: JSON.stringify(data),
  }).then(async response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(await errorHandler(response));
    }
  });
};



export {
  core,
  accounts,
  metrics,

  setStore,
};

export default core;
