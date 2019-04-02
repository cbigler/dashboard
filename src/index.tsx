import '@babel/polyfill'; // Polyfills for IE
import 'react-app-polyfill/ie11'; // For IE 11 support

import React from 'react';
import ReactDOM from 'react-dom';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

import core, { config as configCore } from './client/core';
import accounts, { config as configAccounts } from './client/accounts';

import ReactGA from 'react-ga';
import moment from 'moment';
import queryString from 'qs';

import { DensityUser } from './types';

// Import @density/ui package for font
import '@density/ui';
import './styles.scss';

import userSet from './actions/user/set';

import objectSnakeToCamel from './helpers/object-snake-to-camel/index';
import WebsocketEventPusher from './helpers/websocket-event-pusher/index';
import mixpanelTrack from './helpers/mixpanel-track/index';
import unsafeHandleWindowResize from './helpers/unsafe-handle-window-resize';
import unsafeNavigateToLandingPage from './helpers/unsafe-navigate-to-landing-page/index';
import unsafeSetSettingsFlagConstructor from './helpers/unsafe-set-settings-flag/index';
import fields from './fields';

// The main app component that renders everything.
import App from './components/app/index';
import IntercomDensity from './components/intercom/index';

// The Environment switcher, used to switch between sets of servers that should be communicated
// with.
import EnvironmentSwitcher, { getActiveEnvironments, getGoSlow } from './components/environment-switcher/index';

// Redux is used to manage state.
import { Provider } from 'react-redux';
import createRouter from '@density/conduit';

// Import all actions required to navigate from one page to another.
import { impersonateUnset } from './actions/impersonate';
import routeTransitionLogin from './actions/route-transition/login';
import routeTransitionLogout from './actions/route-transition/logout';
import routeTransitionExplore from './actions/route-transition/explore';
import routeTransitionExploreSpaceTrends from './actions/route-transition/explore-space-trends';
import routeTransitionExploreSpaceDaily from './actions/route-transition/explore-space-daily';
import routeTransitionExploreSpaceDataExport from './actions/route-transition/explore-space-data-export';
import routeTransitionExploreSpaceMeetings from './actions/route-transition/explore-space-meetings';
import routeTransitionLiveSpaceList from './actions/route-transition/live-space-list';
import routeTransitionLiveSpaceDetail from './actions/route-transition/live-space-detail';
import routeTransitionAccount from './actions/route-transition/account';
import routeTransitionAccountRegister from './actions/route-transition/account-register';
import routeTransitionAccountForgotPassword from './actions/route-transition/account-forgot-password';
import routeTransitionAccountSetupOverview from './actions/route-transition/account-setup-overview';
import routeTransitionAccountSetupDoorwayList from './actions/route-transition/account-setup-doorway-list';
import routeTransitionAccountSetupDoorwayDetail from './actions/route-transition/account-setup-doorway-detail';
import routeTransitionDashboardList from './actions/route-transition/dashboard-list';
import routeTransitionDashboardDetail from './actions/route-transition/dashboard-detail';

import routeTransitionAdminIntegrations from './actions/route-transition/admin-integrations';
import routeTransitionAdminUserManagement from './actions/route-transition/admin-user-management';
import routeTransitionAdminUserManagementDetail from './actions/route-transition/admin-user-management-detail';
import routeTransitionAdminDeveloper from './actions/route-transition/admin-developer';
import routeTransitionAdminDeviceStatus from './actions/route-transition/admin-device-status';

import sessionTokenSet from './actions/session-token/set';
import redirectAfterLogin from './actions/miscellaneous/redirect-after-login';
import collectionSpacesSet from './actions/collection/spaces/set';
import collectionSpacesCountChange from './actions/collection/spaces/count-change';
import { collectionSpacesBatchSetEvents } from './actions/collection/spaces/set-events';

import eventPusherStatusChange from './actions/event-pusher/status-change';

// All the reducer and store code is in a separate file.
import storeFactory from './store';
const store = storeFactory();


// ----------------------------------------------------------------------------
// Set the location of all microservices.
// Here's how it works:
// ----------------------------------------------------------------------------
//
// 1. All microservice names and cofigurations are defined in `fields`. `setServiceLocations` is
// called, passing the active environment names. By setting this initially before the react render
// happens, calls that happen before the render are able to take advantage of the custom
// environments that have been defined.
//
// 2. Developer opens the environment switcher modal, changes an environment variable, then clicks
// "ok". The `EnvironmentSwitcher` component's `onChange` is fired, which calls
// `setServiceLocations`. The locations of all the services update.
//
function configureClients(environments, goSlow) {
  const impersonateUser = localStorage.impersonate ?
    (JSON.parse(localStorage.impersonate).selectedUser || {}).id : undefined;
  configCore({host: environments.core, impersonateUser, goSlow, store});
  configAccounts({host: environments.accounts, impersonateUser, store});
}
configureClients(getActiveEnvironments(fields), getGoSlow());


// Send metrics to google analytics and mixpanel when the page url changes.
if (process.env.REACT_APP_GA_TRACKING_CODE) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_CODE);
}
function trackHashChange() {
  // Any query parameters in the below list will be sent to google analytics and mixpanel
  const qs = queryString.parse(window.location.search);
  const analyticsParameters = [
    'ref',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
  ].reduce((acc, tag) => {
    const value = qs[`?${tag}`] || qs[tag];
    if (value) {
      return {...acc, [tag]: value};
    } else {
      return acc;
    }
  }, {});

  // Mixpanel: track url chage
  mixpanelTrack('Pageview', {
    ...analyticsParameters,
    url: window.location.hash,
  });

  // Google analytics: track page view
  if (process.env.REACT_APP_GA_TRACKING_CODE) {
    ReactGA.pageview(window.location.hash);
    ReactGA.set(analyticsParameters);
  }
};
window.addEventListener('hashchange', trackHashChange);
trackHashChange();

// Routing helper to redirect to a different url when a user visits a url.
function redirect(url) {
  return (...args) => {
    if (typeof url === 'function') {
      window.location.href = `#/${url(...args)}`;
    } else {
      window.location.href = `#/${url}`;
    }
    // FIXME: Conduit shouldn't dispatch an action if a function returns undefined. That would let the
    // below line be removed.
    return {type: 'NOOP'};
  }
}


// Create a router to listen to the store and dispatch actions when the hash changes.
// Uses conduit, an open source router we made at Density: https://github.com/DensityCo/conduit
const router = createRouter(store);
router.addRoute('login', () => routeTransitionLogin(null));
router.addRoute('logout', () => routeTransitionLogout());
router.addRoute('access_token=:oauth', () => ({type: 'NOOP'}));

// v I AM DEPRECATED
router.addRoute('insights/spaces', redirect('spaces/explore')); // DEPRECATED
router.addRoute('spaces/insights/:id', redirect(id => `spaces/explore/${id}/trends`)); // DEPRECATED
router.addRoute('spaces/insights', redirect(`spaces/explore`)); // DEPRECATED
router.addRoute('spaces/insights/:id/trends', redirect(id => `spaces/explore/${id}/trends`)); // DEPRECATED
router.addRoute('spaces/insights/:id/daily', redirect(id => `spaces/explore/${id}/daily`)); // DEPRECATED
router.addRoute('spaces/insights/:id/data-export', redirect(id => `spaces/explore/${id}/data-export`)); // DEPRECATED
// ^ I AM DEPRECATED

router.addRoute('dashboards', () => routeTransitionDashboardList());
router.addRoute('dashboards/:id', id => routeTransitionDashboardDetail(id));

router.addRoute('spaces/explore', () => routeTransitionExplore());
router.addRoute('spaces/explore/:id/trends', id => routeTransitionExploreSpaceTrends(id));
router.addRoute('spaces/explore/:id/daily', id => routeTransitionExploreSpaceDaily(id));
router.addRoute('spaces/explore/:id/data-export', id => routeTransitionExploreSpaceDataExport(id));
router.addRoute('spaces/explore/:id/meetings', id => routeTransitionExploreSpaceMeetings(id));

router.addRoute('spaces/live', () => routeTransitionLiveSpaceList());
router.addRoute('spaces/live/:id', id => routeTransitionLiveSpaceDetail(id));

router.addRoute('account', () => routeTransitionAccount());

// User registration and password resetting
router.addRoute('account/register/:slug', slug => routeTransitionAccountRegister(slug));
router.addRoute('account/forgot-password/:token', token => routeTransitionAccountForgotPassword(token));

// Advanced account management (Administration)
router.addRoute('admin/integrations', () => routeTransitionAdminIntegrations());
router.addRoute('admin/user-management', () => routeTransitionAdminUserManagement());
router.addRoute('admin/user-management/:id', id => routeTransitionAdminUserManagementDetail(id));
router.addRoute('admin/developer', () => routeTransitionAdminDeveloper());
router.addRoute('admin/device-status', () => routeTransitionAdminDeviceStatus());

// Onboarding flow
// Redirect #/onboarding => #/onboarding/overview
router.addRoute('onboarding', redirect('onboarding/overview'));
router.addRoute('onboarding/overview', () => routeTransitionAccountSetupOverview());
router.addRoute('onboarding/doorways', () => routeTransitionAccountSetupDoorwayList());
router.addRoute('onboarding/doorways/:id', id => routeTransitionAccountSetupDoorwayDetail(id));

// Add a helper into the global namespace to allow changing of settings flags on the fly.
(window as any).setSettingsFlag = unsafeSetSettingsFlagConstructor(store);

// Add a handler to debounce & handle window resize events
(window as any).resizeHandler = unsafeHandleWindowResize(store);

// Make sure that the user is logged in prior to going to a page.
function preRouteAuthentication() {
  const loggedIn = (store.getState() as any).sessionToken !== null;
  const locationHash = window.location.hash;
  const accessTokenMatch = locationHash.match(/^#access_token=([^&]+)/);

  // If the hash has an OAuth access token, exchange it for an API token
  if (accessTokenMatch) {
    return accounts().post('/tokens/exchange/auth0', null, {
      headers: { 'Authorization': `JWT ${accessTokenMatch[1]}`}
    }).then(response => {
      store.dispatch(impersonateUnset());
      store.dispatch<any>(sessionTokenSet(response.data)).then(data => {
        const user: any = objectSnakeToCamel(data);
        unsafeNavigateToLandingPage(user.organization.settings, null, true);
      })
    }).catch(err => {
      window.localStorage.auth0LoginError = err.toString();
      router.navigate('login');
    });
  // If on the account registration page (the only page that doesn't require the user to be logged in)
  // then don't worry about any of this.
  } else if (
    locationHash.startsWith("#/account/register") ||
    locationHash.startsWith("#/account/forgot-password")
  ) {
    return Promise.resolve();
  // If the user isn't logged in, send them to the login page.
  } else if (!loggedIn) {
    store.dispatch(redirectAfterLogin(locationHash));
    router.navigate('login');
    return Promise.resolve();
  // Otherwise, fetch the logged in user's info since there's a session token available.
  } else {
    // Look up the user info before we can redirect to the landing page.
    return accounts().get('/users/me').then(response => {
      if (response.data) {
        // A valid user object was returned, so add it to the store.
        store.dispatch(userSet(response.data));

        // Then, navigate the user to the landing page.
        unsafeNavigateToLandingPage(objectSnakeToCamel<DensityUser>(response.data).organization.settings, null);
      } else {
        // User token expired (and no user object was returned) so redirect to login page.
        store.dispatch(redirectAfterLogin(locationHash));
        router.navigate('login');
      }
    });
  }
}

// Handle the route that the user is currently at.
preRouteAuthentication().then(() => router.handle());


// ----------------------------------------------------------------------------
// Real time event source
// Listen in real time for pushed events via websockets. When we receive
// events, dispatch them as actions into the system.
// ----------------------------------------------------------------------------
const eventSource = new WebsocketEventPusher();

// Reconnect to the socket when the token changes.
let currentToken = null;
store.subscribe(() => {
  const newToken = (store.getState() as any).sessionToken;
  if (newToken !== currentToken) {
    currentToken = newToken;
    eventSource.connect();
  }
});

// When the state of the connection changes, sync that change into redux.
eventSource.on('connectionStateChange', newConnectionState => {
  store.dispatch(eventPusherStatusChange(newConnectionState));
});

// When the event source disconnects, fetch the state of each space from the core api to ensure that
// the dashboard hasn't missed any events.
eventSource.on('connected', async () => {
  const spaces = (await core().get('/spaces')).data;
  store.dispatch(collectionSpacesSet(spaces.results));

  const spaceEventSets: any = await Promise.all(spaces.results.map(space => {
    return core().get(`/spaces/${space.id}/events`, { params: {
      start_time: moment.utc().subtract(1, 'minute').format(),
      end_time: moment.utc().format(),
    }});
  }));

  const eventsAtSpaces = spaceEventSets.reduce((acc, next, index) => {
    acc[spaces.results[index].id] = next.data.results.map(i => ({ 
      countChange: i.direction,
      timestamp: i.timestamp
    }));
    return acc;
  }, {});
  store.dispatch(collectionSpacesBatchSetEvents(eventsAtSpaces));
});

eventSource.on('space', countChangeEvent => {
  store.dispatch(collectionSpacesCountChange({
    id: countChangeEvent.spaceId,
    timestamp: countChangeEvent.timestamp,
    // In v2, the API uses "direction" to for a count change, due to a traffic event, at a space.
    // In the future "count change" should refer to ANY count change at a space, including resets.
    // TODO: The UI does not show "live" resets, so review other instances of `countChange`.
    countChange: countChangeEvent.direction,
  }));
});

// If the user is logged in, sync the count of all spaces with the server every 5 minutes.
// This is to ensure that the count on the dashboard and the actual count can't drift really far
// apart throughout the day if you don't refresh the dashboard.
setInterval(async () => {
  const loggedIn = (store.getState() as any).sessionToken !== null;

  if (loggedIn) {
    const spaces = (await core().get('/spaces')).data;
    store.dispatch(collectionSpacesSet(spaces.results));
  }
},  5 * 60 * 1000);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <App />
      <IntercomDensity />
      <EnvironmentSwitcher
        keys={['!', '!', '`', ' ']} // Press '!!` ' to open environment switcher.
        fields={fields}
        onChange={configureClients}
      />
    </div>
  </Provider>,
  document.getElementById('root')
);

unregisterServiceWorker();
