import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './built-css/styles.css';
import { core, accounts } from './client';
import ReactGA from 'react-ga';

import userSet from './actions/user/set';
import userPush from './actions/user/push';
import userError from './actions/user/error';
import sessionTokenUnSet from './actions/session-token/unset';

import objectSnakeToCamel from './helpers/object-snake-to-camel/index';
import eventSource from './helpers/websocket-event-pusher/index';
import mixpanelTrack from './helpers/mixpanel-track/index';

// The main app component that renders everything.
import App from './components/app/index';

// The Environment switcher, used to switch between sets of servers that should be communicated
// with.
import EnvironmentSwitcher, { getActiveEnvironments } from './components/environment-switcher/index';

// Redux is used to manage state.
import { Provider } from 'react-redux';
import createRouter from '@density/conduit';

// Import all actions required to navigate from one page to another.
import routeTransitionEnvironmentSpace from './actions/route-transition/environment-space';
import routeTransitionLogin from './actions/route-transition/login';
import routeTransitionVisualizationSpaceDetail from './actions/route-transition/visualization-space-detail';
import routeTransitionVisualizationSpaceList from './actions/route-transition/visualization-space-list';
import routeTransitionDevTokenList from './actions/route-transition/dev-token-list';
import routeTransitionDevWebhookList from './actions/route-transition/dev-webhook-list';
import routeTransitionAccount from './actions/route-transition/account';
import routeTransitionAccountRegister from './actions/route-transition/account-register';
import routeTransitionAccountForgotPassword from './actions/route-transition/account-forgot-password';
import routeTransitionAccountSetupOverview from './actions/route-transition/account-setup-overview';
import routeTransitionAccountSetupDoorwayList from './actions/route-transition/account-setup-doorway-list';
import routeTransitionAccountSetupDoorwayDetail from './actions/route-transition/account-setup-doorway-detail';

import collectionSpacesCountChange from './actions/collection/spaces/count-change';

// All the reducer and store code is in a seperate file.
import storeFactory from './store';
import unsafeNavigateToLandingPage from './helpers/unsafe-navigate-to-landing-page/index';
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

const fields = [
  {
    name: 'Core API',
    slug: 'core',
    defaults: {
      'production': 'https://api.density.io/v2',
      'staging': 'https://core-staging.branch.density.io/v2',
      'local': 'http://localhost:8000/v2',
      'env (REACT_APP_CORE_API_URL)': process.env.REACT_APP_CORE_API_URL,
    },
    default: process.env.REACT_APP_ENVIRONMENT || 'production',
  },
  {
    name: 'Accounts API',
    slug: 'accounts',
    defaults: {
      'production': 'https://clerk.density.io/v1',
      'staging': 'https://accounts-staging.branch.density.io/v1',
      'local': 'http://localhost:8001/v1',
      'env (REACT_APP_ACCOUNTS_API_URL)': process.env.REACT_APP_ACCOUNTS_API_URL,
    },
    default: process.env.REACT_APP_ENVIRONMENT || 'production',
  },
  {
    name: 'Event source (websockets server)',
    slug: 'eventsource',
    defaults: {
      'none': 'false',
      'production': 'wss://socket.density.io',
      'staging': 'wss://socket.density.rodeo',
      'local': 'ws://localhost:8080',
      'env (REACT_APP_EVENTSOURCE_API_URL)': process.env.REACT_APP_EVENTSOURCE_API_URL,
    },
    default: process.env.REACT_APP_ENVIRONMENT || 'production',
  },
];
function setServiceLocations(data) {
  core.config({core: data.core});
  accounts.config({host: data.accounts});
  if (data.eventsource !== 'false') {
    eventSource.setHost(data.eventsource);
  }
}
setServiceLocations(getActiveEnvironments(fields)); /* step 1 above */


// Send metrics to google analytics and mixpanel when the page url changes.
if (process.env.REACT_APP_GA_TRACKING_CODE) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_CODE);
}
function trackHashChange() {
  // Mixpanel: track url change
  mixpanelTrack('Pageview', { url: window.location.hash });

  // Google analytics: track page view
  if (process.env.REACT_APP_GA_TRACKING_CODE) {
    ReactGA.pageview(window.location.hash);
  }
};
window.addEventListener('hashchange', trackHashChange);
trackHashChange();


// Create a router to listen to the store and dispatch actions when the hash changes.
// Uses conduit, an open source router we made at Density: https://github.com/DensityCo/conduit
const router = createRouter(store);
router.addRoute('login', () => routeTransitionLogin());

router.addRoute('insights/spaces', () => routeTransitionVisualizationSpaceList());
router.addRoute('insights/spaces/:id', id => routeTransitionVisualizationSpaceDetail(id));

router.addRoute('environment/spaces', () => routeTransitionEnvironmentSpace());

router.addRoute('dev/tokens', () => routeTransitionDevTokenList());
router.addRoute('dev/webhooks', () => routeTransitionDevWebhookList());

router.addRoute('account', () => routeTransitionAccount());

// User registration and password resetting
router.addRoute('account/register/:slug', slug => routeTransitionAccountRegister(slug));
router.addRoute('account/forgot-password/:token', token => routeTransitionAccountForgotPassword(token));

// Onboarding flow
// Redirect #/account/setup => #/account/setup/overview
router.addRoute('account/setup', () => {
  window.location.href = '#/account/setup/overview';
  // FIXME: Conduit shouldn't dispatch an action if a function returns undefined. That would let the
  // below line be removed.
  return {type: 'NOOP'};
});
router.addRoute('account/setup/overview', () => routeTransitionAccountSetupOverview());
router.addRoute('account/setup/doorways', () => routeTransitionAccountSetupDoorwayList());
router.addRoute('account/setup/doorways/:id', id => routeTransitionAccountSetupDoorwayDetail(id));

// Make sure that the user is logged in prior to going to a page.
function preRouteAuthentication() {
  const loggedIn = store.getState().sessionToken !== null;

  // If on the account registration page (the only page that doesn't require the user to be logged in)
  // then don't worry about any of this.
  if (
    window.location.hash.startsWith("#/account/register") ||
    window.location.hash.startsWith("#/account/forgot-password")
  ) {
    return;

  // If the user isn't logged in, send them to the login page.
  } else if (!loggedIn) {
    router.navigate('login');

  // Otherwise, fetch the logged in user's info since there's a session token available.
  } else {
    // Look up the user info before we can redirect to the landing page.
    return accounts.users.me().then(data => data).catch(err => {
      // Login failed! Redirect the user to the login page and remove the bad session token from
      // the reducer.
      store.dispatch(userError(`User not logged in. Redirecting to login page. ${err}`));
      store.dispatch(sessionTokenUnSet());
      router.navigate('login');
    }).then(data => {
      store.dispatch(userSet(data));
      unsafeNavigateToLandingPage(objectSnakeToCamel(data).organization.settings.insightsPageLocked);
    });
  }
}
preRouteAuthentication();

// Set a feature flag from the console.
window.setFeatureFlag = function setFeatureFlag(flag, value) {
  const user = store.getState().user.user;
  if (!user) {
    throw new Error('Please wait for the user collection to load before changing feature flags.');
  }

  const features = { [flag]: value };
  store.dispatch(userPush({
    features: {...user.features, ...features},
  }));
}

// Handle the route that the user is currently at.
router.handle();


// ----------------------------------------------------------------------------
// Real time event source
// Listen in real time for pushed events via websockets. When we receive
// events, dispatch them as actions into the system.
// ----------------------------------------------------------------------------
eventSource.setToken(store.getState().sessionToken);
eventSource.events.on('space', countChangeEvent => {
  store.dispatch(collectionSpacesCountChange({
    id: countChangeEvent.spaceId,
    timestamp: countChangeEvent.timestamp,
    // In v2, the API uses "direction" to for a count change, due to a traffic event, at a space.
    // In the future "count change" should refer to ANY count change at a space, including resets.
    // TODO: The UI does not show "live" resets, so review other instances of `countChange`.
    countChange: countChangeEvent.direction,
  }));
});

ReactDOM.render(
  <Provider store={store}>
    <div>
      <App />

      <EnvironmentSwitcher
        keys={['!', '!', '`', ' ']} // Press '!!` ' to open environment switcher.
        fields={fields}
        onChange={setServiceLocations}
      />
    </div>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
