// Polyfills for IE
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import "core-js/stable";
import "regenerator-runtime/runtime";

import React from 'react';
import ReactDOM from 'react-dom';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

import accounts from './client/accounts';

import ReactGA from 'react-ga';
import queryString from 'qs';

import { DensityUser, DensitySpace } from './types';

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
import EnvironmentSwitcher from './components/environment-switcher/index';

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
import routeTransitionDashboardList from './actions/route-transition/dashboard-list';
import routeTransitionDashboardDetail from './actions/route-transition/dashboard-detail';
import routeTransitionDashboardEdit from './actions/route-transition/dashboard-edit';

import routeTransitionAdminSpaceMappings from './actions/route-transition/admin-space-mappings';
import routeTransitionAdminIntegrations from './actions/route-transition/admin-integrations';
import routeTransitionAdminIntegrationsTeem from './actions/route-transition/admin-integrations-teem';
import routeTransitionAdminIntegrationsServiceFailure from './actions/route-transition/admin-integrations-service-failure';
import routeTransitionAdminIntegrationsServiceSuccess from './actions/route-transition/admin-integrations-service-success';
import routeTransitionAdminIntegrationsSlack from './actions/route-transition/admin-integrations-slack';
import routeTransitionAdminUserManagement from './actions/route-transition/admin-user-management';
import routeTransitionAdminUserManagementDetail from './actions/route-transition/admin-user-management-detail';
import routeTransitionAdminDeveloper from './actions/route-transition/admin-developer';
import routeTransitionAdminDeviceStatus from './actions/route-transition/admin-device-status';
import routeTransitionAdminLocations from './actions/route-transition/admin-locations';
import routeTransitionAdminLocationsEdit from './actions/route-transition/admin-locations-edit';
import routeTransitionAdminLocationsNew from './actions/route-transition/admin-locations-new';

import sessionTokenSet from './actions/session-token/set';
import incrementResizeCounter from './actions/miscellaneous/increment-resize-counter';
import redirectAfterLogin from './actions/miscellaneous/redirect-after-login';
import collectionSpacesSet from './actions/collection/spaces/set';
import collectionSpacesCountChange from './actions/collection/spaces/count-change';
import { collectionSpacesBatchSetEvents } from './actions/collection/spaces/set-events';

import eventPusherStatusChange from './actions/event-pusher/status-change';

// All the reducer and store code is in a separate file.
import storeFactory from './store';
import handleVisibilityChange from './helpers/visibility-change';
import fetchAllObjects from './helpers/fetch-all-objects';
import { formatInISOTime, getCurrentLocalTimeAtSpace } from './helpers/space-time-utilities';
import { configureClients } from './helpers/unsafe-configure-app';

export const store = storeFactory();

configureClients(store);


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

  const loggedIn = (store.getState() as any).sessionToken !== null;

  // Mixpanel: track url chage
  if (loggedIn) {
    mixpanelTrack('Pageview', {
      ...analyticsParameters,
      url: window.location.hash,
    });  
  }

  // google analytics: track page view
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
router.addRoute('spaces/insights', redirect(`spaces/explore`)); // DEPRECATED
router.addRoute('spaces/insights/:id', redirect(id => `spaces/explore/${id}`)); // DEPRECATED
router.addRoute('spaces/insights/:id/trends', redirect(id => `spaces/explore/${id}/trends`)); // DEPRECATED
router.addRoute('spaces/insights/:id/daily', redirect(id => `spaces/explore/${id}/daily`)); // DEPRECATED
router.addRoute('spaces/insights/:id/data-export', redirect(id => `spaces/explore/${id}/data-export`)); // DEPRECATED

router.addRoute('spaces/explore', redirect(`spaces`)); // DEPRECATED
router.addRoute('spaces/explore/:id', redirect(id => `spaces/${id}`)); // DEPRECATED
router.addRoute('spaces/explore/:id/trends', redirect(id => `spaces/${id}/trends`)); // DEPRECATED
router.addRoute('spaces/explore/:id/daily', redirect(id => `spaces/${id}/daily`)); // DEPRECATED
router.addRoute('spaces/explore/:id/data-export', redirect(id => `spaces/${id}/data-export`)); // DEPRECATED
// ^ I AM DEPRECATED

router.addRoute('dashboards', () => routeTransitionDashboardList());
router.addRoute('dashboards/:id/edit', id => routeTransitionDashboardEdit(id));
router.addRoute('dashboards/:id', id => routeTransitionDashboardDetail(id));

router.addRoute('spaces', () => routeTransitionExplore());
router.addRoute('spaces/:id', redirect(id => `spaces/${id}/trends`));
router.addRoute('spaces/:id/trends', id => routeTransitionExploreSpaceTrends(id));
router.addRoute('spaces/:id/daily', id => routeTransitionExploreSpaceDaily(id));
router.addRoute('spaces/:id/data-export', id => routeTransitionExploreSpaceDataExport(id));
router.addRoute('spaces/:id/meetings', id => routeTransitionExploreSpaceMeetings(id, null));
router.addRoute('spaces/:id/meetings/:service', (id, service) => routeTransitionExploreSpaceMeetings(id, service));
router.addRoute('spaces/live', () => routeTransitionLiveSpaceList());
router.addRoute('spaces/live/:id', id => routeTransitionLiveSpaceDetail(id));

router.addRoute('account', () => routeTransitionAccount());

// User registration and password resetting
router.addRoute('account/register/:slug', slug => routeTransitionAccountRegister(slug));
router.addRoute('account/forgot-password/:token', token => routeTransitionAccountForgotPassword(token));

// Advanced account management (Administration)
router.addRoute('admin/integrations/:service/space-mappings', (service) => routeTransitionAdminSpaceMappings(service));
router.addRoute('admin/integrations', () => routeTransitionAdminIntegrations());
router.addRoute('admin/integrations/google-calendar/fail', (code) => routeTransitionAdminIntegrationsServiceFailure());
router.addRoute('admin/integrations/google-calendar/success', (code) => routeTransitionAdminIntegrationsServiceSuccess());
router.addRoute('admin/integrations/outlook/fail', (code) => routeTransitionAdminIntegrationsServiceFailure());
router.addRoute('admin/integrations/outlook/success', (code) => routeTransitionAdminIntegrationsServiceSuccess());
router.addRoute('admin/integrations/teem/fail', (code) => routeTransitionAdminIntegrationsServiceFailure());
router.addRoute('admin/integrations/teem/:access_token/:expires_in/:refresh_token/:token_type', (access_token, expires_in, refresh_token, token_type) => routeTransitionAdminIntegrationsTeem(access_token, expires_in, refresh_token, token_type));
router.addRoute('admin/integrations/slack/:code', (code) => routeTransitionAdminIntegrationsSlack(code));
router.addRoute('admin/user-management', () => routeTransitionAdminUserManagement());
router.addRoute('admin/user-management/:id', id => routeTransitionAdminUserManagementDetail(id));
router.addRoute('admin/developer', () => routeTransitionAdminDeveloper());
router.addRoute('admin/device-status', () => routeTransitionAdminDeviceStatus());
router.addRoute('admin/locations', () => routeTransitionAdminLocations(null));
router.addRoute('admin/locations/create/:spaceType', (spaceType) => routeTransitionAdminLocationsNew(null, spaceType));
router.addRoute('admin/locations/:id', id => routeTransitionAdminLocations(id));
router.addRoute('admin/locations/:id/edit', id => routeTransitionAdminLocationsEdit(id));
router.addRoute('admin/locations/:id/create/:spaceType', (id, spaceType) => routeTransitionAdminLocationsNew(id, spaceType));

// Add a helper into the global namespace to allow changing of settings flags on the fly.
(window as any).setSettingsFlag = unsafeSetSettingsFlagConstructor(store);

// Add a handler to debounce & handle window resize events
(window as any).resizeHandler = unsafeHandleWindowResize(() => store.dispatch(incrementResizeCounter()));

// Make sure that the user is logged in prior to going to a page.
async function preRouteAuthentication() {
  const loggedIn = (store.getState() as any).sessionToken !== null;
  const locationHash = window.location.hash;
  const accessTokenMatch = locationHash.match(/^#access_token=([^&]+)/);

  // If the hash has an OAuth access token, exchange it for an API token
  if (accessTokenMatch) {
    // If the originating origin of the login request was not this dashboard instance, then redirect
    // to the originating dashboard instance. Ie, a user tried to login via oauth on a preview link,
    // and it redirected to the staging dashboard, not the preview link dashboard. Redirect back to
    // the preview link.
    const loginOAuthOrigin = window.localStorage.loginOAuthOrigin;
    delete window.localStorage.loginOAuthOrigin;

    const hashIndex = window.location.href.indexOf('#');
    const currentOrigin = window.location.href.slice(0, hashIndex).replace(/\/$/, '');

    if (loginOAuthOrigin && loginOAuthOrigin !== currentOrigin) {
      const hashIndex = window.location.href.indexOf('#');
      const newHref = loginOAuthOrigin + window.location.href.slice(hashIndex);

      console.warn(`Redirecting from ${window.location.href} to ${newHref} because oauth callback hit a different domain than it originated at`); 
      window.location.href = newHref;
    }

    return accounts().post('/tokens/exchange/auth0', null, {
      headers: { 'Authorization': `JWT ${accessTokenMatch[1]}`}
    }).then(response => {
      store.dispatch(impersonateUnset());
      configureClients();
      store.dispatch<any>(sessionTokenSet(response.data)).then(data => {
        const user: any = objectSnakeToCamel(data);
        unsafeNavigateToLandingPage(user.organization.settings, null, true);
      });
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
    return;

  // If the user isn't logged in, send them to the login page.
  } else if (!loggedIn) {
    store.dispatch(redirectAfterLogin(locationHash));
    router.navigate('login');
    return;

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
  const spaces = await fetchAllObjects<DensitySpace>('/spaces');
  store.dispatch(collectionSpacesSet(spaces));

  const spaceEventSets: any = await Promise.all(spaces.map(space => {
    return fetchAllObjects(`/spaces/${space.id}/events`, {
      params: {
        start_time: formatInISOTime(getCurrentLocalTimeAtSpace(space).subtract(1, 'minute')),
        end_time: formatInISOTime(getCurrentLocalTimeAtSpace(space)),
      }
    });
  }));

  const eventsAtSpaces = spaceEventSets.reduce((acc, next, index) => {
    acc[spaces[index].id] = next.map(i => ({ 
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
    const spaces = await fetchAllObjects<DensitySpace>('/spaces');
    store.dispatch(collectionSpacesSet(spaces));
  }
},  5 * 60 * 1000);

// When the page transitions visibility, connect or disconnect the event source
// This prevents pushed events from piling up and crashing the page when not rendered
handleVisibilityChange(hidden => {
  if (hidden) {
    eventSource.disconnect();
  } else {
    eventSource.connect();
  }
})

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
