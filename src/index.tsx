// Polyfills for IE
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

import accounts from './client/accounts';

import ReactGA from 'react-ga';
import queryString from 'qs';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreUser } from '@density/lib-api-types/core-v2/users';

// Import @density/ui package for font
import '@density/ui';
import './styles.scss';

import userSet from './rx-actions/user/set';

import WebsocketEventPusher, { CONNECTION_STATES } from './helpers/websocket-event-pusher/index';
import mixpanelTrack from './helpers/tracking/mixpanel-track';
import unsafeHandleWindowResize from './helpers/unsafe-handle-window-resize';
import unsafeNavigateToLandingPage from './helpers/unsafe-navigate-to-landing-page/index';
import fields from './fields';

// The main app component that renders everything.
import App from './components/app/index';
import IntercomDensity from './components/intercom/index';

// The Environment switcher, used to switch between sets of servers that should be communicated
// with.
import EnvironmentSwitcher from './components/environment-switcher/index';

// import createRouter from '@density/conduit';
import createRouter from './router';

// Import all actions required to navigate from one page to another.
import { impersonateUnset } from './rx-actions/impersonate';
import routeTransitionLogin from './rx-actions/route-transition/login';
import routeTransitionLogout from './rx-actions/route-transition/logout';
import routeTransitionSpaces from './rx-actions/route-transition/spaces';
import routeTransitionSpacesSpace from './rx-actions/route-transition/spaces-space';
import routeTransitionSpacesDoorway from './rx-actions/route-transition/spaces-doorway';
import routeTransitionLiveSpaceList from './rx-actions/route-transition/live-space-list';
import routeTransitionLiveSpaceDetail from './rx-actions/route-transition/live-space-detail';
import routeTransitionAccount from './rx-actions/route-transition/account';
import routeTransitionAccountRegister from './rx-actions/route-transition/account-register';
import routeTransitionAccountForgotPassword from './rx-actions/route-transition/account-forgot-password';
import routeTransitionDashboardList from './rx-actions/route-transition/dashboard-list';
import routeTransitionDashboardDetail from './rx-actions/route-transition/dashboard-detail';
import routeTransitionDashboardEdit from './rx-actions/route-transition/dashboard-edit';

import routeTransitionAdminSpaceMappings from './rx-actions/route-transition/admin-space-mappings';
import routeTransitionAdminBrivoMappings from './rx-actions/route-transition/admin-brivo-mappings';
import routeTransitionAdminIntegrations from './rx-actions/route-transition/admin-integrations';
import routeTransitionAdminIntegrationsTeem from './rx-actions/route-transition/admin-integrations-teem';
import routeTransitionAdminIntegrationsServiceFailure from './rx-actions/route-transition/admin-integrations-service-failure';
import routeTransitionAdminIntegrationsServiceSuccess from './rx-actions/route-transition/admin-integrations-service-success';
import routeTransitionAdminIntegrationsSlack from './rx-actions/route-transition/admin-integrations-slack';
import routeTransitionAdminUserManagement from './rx-actions/route-transition/admin-user-management';
import routeTransitionAdminUserManagementDetail from './rx-actions/route-transition/admin-user-management-detail';
import routeTransitionAdminDeveloper from './rx-actions/route-transition/admin-developer';
import routeTransitionAdminDeviceStatus from './rx-actions/route-transition/admin-device-status';
import routeTransitionAdminLocations from './rx-actions/route-transition/admin-locations';
import routeTransitionAdminLocationsEdit from './rx-actions/route-transition/admin-locations-edit';
import routeTransitionAdminLocationsNew from './rx-actions/route-transition/admin-locations-new';
import { AnalyticsActionType } from './rx-actions/analytics';

import sessionTokenSet from './rx-actions/session-token/set';
import incrementResizeCounter from './rx-actions/miscellaneous/increment-resize-counter';
import redirectAfterLogin from './rx-actions/miscellaneous/redirect-after-login';
import collectionSpacesSet from './rx-actions/collection/spaces-legacy/set';
import collectionSpacesCountChange from './rx-actions/collection/spaces-legacy/count-change';
import { collectionSpacesBatchSetEvents } from './rx-actions/collection/spaces-legacy/set-events';

import eventPusherStatusChange from './rx-actions/event-pusher/status-change';

import handleVisibilityChange from './helpers/visibility-change';
import fetchAllObjects, { fetchObject } from './helpers/fetch-all-objects';
import { formatInISOTime, getCurrentLocalTimeAtSpace } from './helpers/space-time-utilities';
import { configureClients } from './helpers/unsafe-configure-app';

import SessionTokenStore from './rx-stores/session-token';
import { SessionTokenState } from './types/session-token';
import { rxDispatch } from './rx-stores';
import ActivePageStore, { ActivePage } from './rx-stores/active-page';
import { combineLatest, take, distinctUntilChanged, filter } from 'rxjs/operators';
import { spacesPageActions } from './rx-actions/spaces-page';
import SpacesPageStore from './rx-stores/spaces-page';
import { SpacesPageState } from './rx-stores/spaces-page/reducer';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import moment from 'moment-timezone';
import SpacesStore, { SpacesState } from './rx-stores/spaces';
import DoorwaysStore, { DoorwaysState } from './rx-stores/doorways';

configureClients();


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

  const loggedIn = SessionTokenStore.imperativelyGetValue() !== null;

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

// Create a router to listen to the store and dispatch actions when the hash changes.
// Uses conduit, an open source router we made at Density: https://github.com/DensityCo/conduit
const router = createRouter();
router.addRoute('login', async () => { (rxDispatch as Any<FixInReview>)(routeTransitionLogin(null)) });
router.addRoute('logout', async () => routeTransitionLogout(rxDispatch));
router.addRoute('access_token=:oauth', async () => {});

router.addRoute('dashboards', () => routeTransitionDashboardList(rxDispatch));
router.addRoute('dashboards/:id/edit', id => routeTransitionDashboardEdit(rxDispatch, id));
router.addRoute('dashboards/:id', id => routeTransitionDashboardDetail(rxDispatch, id));

router.addRoute('spaces', () => routeTransitionSpaces(rxDispatch));
router.addRoute('spaces/:id', id => routeTransitionSpacesSpace(rxDispatch, id));
router.addRoute('spaces/:id/doorways/:id', (space_id, doorway_id) => routeTransitionSpacesDoorway(rxDispatch, space_id, doorway_id));
router.addRoute('spaces/live', () => routeTransitionLiveSpaceList(rxDispatch));
router.addRoute('spaces/live/:id', id => routeTransitionLiveSpaceDetail(rxDispatch, id));

router.addRoute('account', () => routeTransitionAccount(rxDispatch));

// User registration and password resetting
router.addRoute('account/register/:slug', async (slug) => { (rxDispatch as Any<FixInReview>)(routeTransitionAccountRegister(slug)) });
router.addRoute('account/forgot-password/:token', async (token) => { (rxDispatch as Any<FixInReview>)(routeTransitionAccountForgotPassword(token)) });

// Advanced account management (Administration)
router.addRoute('admin/integrations/:service/space-mappings', async (service) => { routeTransitionAdminSpaceMappings(rxDispatch, service) });
router.addRoute('admin/integrations/brivo/doorway-mappings', async (service) => { routeTransitionAdminBrivoMappings(rxDispatch) });
router.addRoute('admin/integrations', async () => await routeTransitionAdminIntegrations(rxDispatch));
router.addRoute('admin/integrations/brivo/fail', (code) => routeTransitionAdminIntegrationsServiceFailure(rxDispatch));
router.addRoute('admin/integrations/brivo/success', (code) => routeTransitionAdminIntegrationsServiceSuccess(rxDispatch));
router.addRoute('admin/integrations/google-calendar/fail', (code) => routeTransitionAdminIntegrationsServiceFailure(rxDispatch));
router.addRoute('admin/integrations/google-calendar/success', (code) => routeTransitionAdminIntegrationsServiceSuccess(rxDispatch));
router.addRoute('admin/integrations/outlook/fail', (code) => routeTransitionAdminIntegrationsServiceFailure(rxDispatch));
router.addRoute('admin/integrations/outlook/success', (code) => routeTransitionAdminIntegrationsServiceSuccess(rxDispatch));
router.addRoute('admin/integrations/teem/fail', (code) => routeTransitionAdminIntegrationsServiceFailure(rxDispatch));
router.addRoute('admin/integrations/teem/:accessToken/:expiresIn/:refreshToken/:token_type', (accessToken, expiresIn, refreshToken, token_type) => routeTransitionAdminIntegrationsTeem(rxDispatch, accessToken, expiresIn, refreshToken, token_type));
router.addRoute('admin/integrations/slack/:code', (code) => routeTransitionAdminIntegrationsSlack(rxDispatch, code));
router.addRoute('admin/user-management', () => routeTransitionAdminUserManagement(rxDispatch));
router.addRoute('admin/user-management/:id', id => routeTransitionAdminUserManagementDetail(rxDispatch, id));
router.addRoute('admin/developer', () => routeTransitionAdminDeveloper(rxDispatch));
router.addRoute('admin/device-status', () => routeTransitionAdminDeviceStatus(rxDispatch));
router.addRoute('admin/locations', () => routeTransitionAdminLocations(rxDispatch, null));
router.addRoute('admin/locations/create/:space_type', (space_type) => routeTransitionAdminLocationsNew(rxDispatch, null, space_type));
router.addRoute('admin/locations/:id', id => routeTransitionAdminLocations(rxDispatch, id));
router.addRoute('admin/locations/:id/edit', id => routeTransitionAdminLocationsEdit(rxDispatch, id));
router.addRoute('admin/locations/:id/create/:space_type', (id, space_type) => routeTransitionAdminLocationsNew(rxDispatch, id, space_type));
router.addRoute('analytics', async () => rxDispatch({ type: AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS }));

// FIXME: why can't this just use state management? why is this on window?
// Add a handler to debounce & handle window resize events
(window as any).resizeHandler = unsafeHandleWindowResize(() => (rxDispatch as Any<FixInReview>)(incrementResizeCounter()));

// Make sure that the user is logged in prior to going to a page.
async function preRouteAuthentication() {
  const loggedIn = SessionTokenStore.imperativelyGetValue() !== null;
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
      headers: { 'Authorization': `JWT ${accessTokenMatch[1]}` }
    }).then(response => {
      (rxDispatch as Any<FixInReview>)(impersonateUnset());
      configureClients();
      sessionTokenSet(rxDispatch, response.data).then(data => {
        unsafeNavigateToLandingPage(data.organization.settings, null, true);
      });
    }).catch(err => {
      window.localStorage.auth0LoginError = err.toString();
      router.navigate('login', {});
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
    (rxDispatch as Any<FixInReview>)(redirectAfterLogin(locationHash));
    router.navigate('login', {});
    return;

  // Otherwise, fetch the logged in user's info since there's a session token available.
  } else {
    // Look up the user info before we can redirect to the landing page.
    return accounts().get('/users/me').then(response => {
      if (response.data) {
        // A valid user object was returned, so add it to the store.
        (rxDispatch as Any<FixInReview>)(userSet(response.data));

        // Then, navigate the user to the landing page.
        unsafeNavigateToLandingPage((response.data as CoreUser).organization.settings, null);
      } else {
        // User token expired (and no user object was returned) so redirect to login page.
        (rxDispatch as Any<FixInReview>)(redirectAfterLogin(locationHash));
        router.navigate('login', {});
      }
    });
  }
}

// Handle the route that the user is currently at.
preRouteAuthentication().then(async () => await router.handle());


// ----------------------------------------------------------------------------
// Real time event sources
// Listen in real time for pushed events via websockets. When we receive
// events, dispatch them as actions into the system.
// ----------------------------------------------------------------------------
const livePageEventSource = new WebsocketEventPusher();
const spacesPageEventSource = new WebsocketEventPusher();

// Connect and disconnect from sockets according to this logic.
let currentToken: SessionTokenState = null;
let onLivePage: boolean = false;
let onSpacesPage: boolean = false;
SessionTokenStore.pipe(combineLatest(ActivePageStore)).subscribe(([token, page]) => {

  // Live page gets events for all spaces
  onLivePage = [ActivePage.LIVE_SPACE_LIST, ActivePage.LIVE_SPACE_DETAIL].indexOf(page) > -1;
  if (!onLivePage &&
    livePageEventSource.connectionState !== CONNECTION_STATES.CLOSED
  ) {
    livePageEventSource.disconnect();
  }
  if (onLivePage &&
    (livePageEventSource.connectionState !== CONNECTION_STATES.CONNECTED || currentToken !== token)
  ) {
    currentToken = token;
    livePageEventSource.connect();
  }

  // Spaces page gets events for just one space (but still receives all events)
  onSpacesPage = [ActivePage.SPACES_SPACE, ActivePage.SPACES_DOORWAY].indexOf(page) > -1;
  if (!onSpacesPage &&
    spacesPageEventSource.connectionState !== CONNECTION_STATES.CLOSED
  ) {
    spacesPageEventSource.disconnect();
  }
  if (onSpacesPage && 
    (spacesPageEventSource.connectionState !== CONNECTION_STATES.CONNECTED || currentToken !== token)
  ) {
    currentToken = token;
    spacesPageEventSource.connect();
  }

});

// When the state of the connection changes, sync that change into redux.
livePageEventSource.on('connectionStateChange', newConnectionState => {
  (rxDispatch as Any<FixInReview>)(eventPusherStatusChange(newConnectionState));
});

// When the event source disconnects, fetch the state of each space from the core api to ensure that
// the dashboard hasn't missed any events.
livePageEventSource.on('connected', async () => {
  const spaces = await fetchAllObjects<CoreSpace>('/spaces');
  rxDispatch(collectionSpacesSet(spaces));

  const spaceEventSets: any = await Promise.all(spaces.map(space => {
    return fetchAllObjects<CoreSpaceEvent>(`/spaces/${space.id}/events`, {
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
  (rxDispatch as Any<FixInReview>)(collectionSpacesBatchSetEvents(eventsAtSpaces));
});

livePageEventSource.on('space', countChangeEvent => {
  // WORKAROUND: The legacy chart only handles a "direction" of 1 or -1
  // So we're sending out many "count changes" in the case of an OB1 reset
  let absoluteDelta = Math.abs(countChangeEvent.direction);
  while (absoluteDelta > 0) {
    (rxDispatch as Any<FixInReview>)(collectionSpacesCountChange({
      id: countChangeEvent.space_id,
      timestamp: countChangeEvent.timestamp,
      countChange: countChangeEvent.direction > 0 ? 1 : -1,
    }));
    absoluteDelta = absoluteDelta - 1;
  }
});

// Handler for a second event source that provides events for a single space (or doorway)
async function handleSpacesPageEventSetup([state, spacesState, doorwaysState]: [SpacesPageState, SpacesState, DoorwaysState]) {
  const selectedSpace = spacesState.data.get(state.spaceId || 'spc_0');
  const selectedDoorway = doorwaysState.data.get(state.doorwayId || 'drw_0');

  if (selectedSpace) {

    // Logic to find the last reset at this space
    const localNow = moment.tz(selectedSpace.time_zone);
    const localOneMinuteAgo = localNow.clone().subtract(1, 'minute');
    const nowTimestamp = moment.tz(selectedSpace.time_zone);
    const resetTime = moment(selectedSpace.daily_reset, 'HH:mm');
    const resetTimestamp = localNow.clone().hour(resetTime.hour()).minute(resetTime.minute()).second(0).millisecond(0);
    if (resetTimestamp > localNow) { resetTimestamp.subtract(1, 'day'); }

    // Fetch space count (used for the current occupancy)
    const currentCount = await fetchObject<{count: number}>(`spaces/${selectedSpace.id}/count`, {
      params: {
        time: formatInISOTime(nowTimestamp),
      }
    });

    // Fetch all events since the last reset
    const events = await fetchAllObjects<CoreSpaceEvent>(`/spaces/${selectedSpace.id}/events`, {
      params: {
        start_time: formatInISOTime(resetTimestamp),
        end_time: formatInISOTime(nowTimestamp),
        doorway_id: selectedDoorway?.id,
        count: true,
      }
    });

    // Aggregate total entrances & exits since the last reset, and save recent events
    const {entrances, exits, recentEvents} = events.reduce((acc, next) => {
      if (next.direction === 1) { acc.entrances += 1; }
      else if (next.direction === -1) { acc.exits += 1; }
      if (moment.tz(next.timestamp, selectedSpace.time_zone) > localOneMinuteAgo) { acc.recentEvents.push(next); }
      return acc;
    }, {entrances: 0, exits: 0, count: 0, recentEvents: [] as Array<CoreSpaceEvent>});

    rxDispatch(spacesPageActions.setAllLiveEvents(recentEvents));
    rxDispatch(spacesPageActions.setLiveStats(
      currentCount.count,
      entrances,
      exits
    ));
  }
}

// Set up the spaces page events whenever the websocket reconnects
spacesPageEventSource.on('connected', () => {
  SpacesPageStore.pipe(
    combineLatest(SpacesStore, DoorwaysStore),
    filter(([spacesPageState, spacesState]) => !!spacesPageState.spaceId && !!spacesState.data.size),
    take(1),
  ).subscribe(handleSpacesPageEventSetup);
});

// Kick the "space event pusher" every time the selected space or doorway changes
SpacesPageStore.pipe(
  combineLatest(SpacesStore, DoorwaysStore),
  filter(([spacesPageState, spacesState, doorwaysState]) => {
    if (!spacesPageState.spaceId ||
        !spacesState.data.has(spacesPageState.spaceId) ||
        (spacesPageState.doorwayId && !doorwaysState.data.has(spacesPageState.doorwayId))
    ) {
      return false;
    }
    return true;
  }),
  distinctUntilChanged(([a], [b]) => a.spaceId === b.spaceId && a.doorwayId === b.doorwayId),
).subscribe(handleSpacesPageEventSetup);

spacesPageEventSource.on('space', countChangeEvent => {
  SpacesPageStore.pipe(
    combineLatest(SpacesStore, DoorwaysStore),
    take(1),
  ).subscribe(([state, spacesState, doorwaysState]) => {
    const selectedSpace = spacesState.data.get(state.spaceId || 'spc_0');
    const selectedDoorway = doorwaysState.data.get(state.doorwayId || 'drw_0');
    if (!selectedSpace) {
      return;
    } else if (selectedSpace.id !== countChangeEvent.space_id) {
      return;
    } else if (selectedDoorway && selectedDoorway.id !== countChangeEvent.doorway_id) {
      return;
    }
    rxDispatch(spacesPageActions.setOneLiveEvent(countChangeEvent));
    rxDispatch(spacesPageActions.setLiveStats(
      Math.max(state.liveEvents.metrics.occupancy + countChangeEvent.direction, 0),
      state.liveEvents.metrics.entrances + (countChangeEvent.direction > 0 ? countChangeEvent.direction : 0),
      state.liveEvents.metrics.exits + (countChangeEvent.direction < 0 ? -1 * countChangeEvent.direction : 0),
    ));
    if (state.dailyDate === moment.tz(selectedSpace.time_zone).format('YYYY-MM-DD')) {
      rxDispatch(spacesPageActions.setDailyOccupancyPeak(countChangeEvent.count));
    }
  });
});

// If the user is logged in, sync the count of all spaces with the server every 5 minutes.
// This is to ensure that the count on the dashboard and the actual count can't drift really far
// apart throughout the day if you don't refresh the dashboard.
setInterval(async () => {
  const loggedIn = SessionTokenStore.imperativelyGetValue() !== null;

  if (loggedIn) {
    const spaces = await fetchAllObjects<CoreSpace>('/spaces');
    (rxDispatch as Any<FixInReview>)(collectionSpacesSet(spaces));
  }
},  5 * 60 * 1000);

// When the page transitions visibility, connect or disconnect the event source
// This prevents pushed events from piling up and crashing the page when not rendered
handleVisibilityChange(hidden => {
  if (hidden) {
    livePageEventSource.disconnect();
    spacesPageEventSource.disconnect();
  } else if (onLivePage) {
    livePageEventSource.connect();
  } else if (onSpacesPage) {
    spacesPageEventSource.connect();
  }
});

// FIXME: empty div? Maybe we want to use a <Fragment /> here
ReactDOM.render(
  (
    <div>
      <App />
      <IntercomDensity />
      <EnvironmentSwitcher
        keys={['!', '!', '`', ' ']} // Press '!!` ' to open environment switcher.
        fields={fields}
        onChange={configureClients}
      />
    </div>
  ),
  document.getElementById('root')
);

unregisterServiceWorker();
