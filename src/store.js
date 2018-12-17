// Redux is used to manage state.
import {createStore, compose, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';

// Assemble all parts of the reducer
import accountForgotPassword from './reducers/account-forgot-password/index';
import accountRegistration from './reducers/account-registration/index';
import activeModal from './reducers/active-modal/index';
import activePage from './reducers/active-page/index';
import doorways from './reducers/doorways/index';
import links from './reducers/links/index';
import sessionToken from './reducers/session-token/index';
import spaces from './reducers/spaces/index';
import tokens from './reducers/tokens/index';
import user from './reducers/user/index';
import webhooks from './reducers/webhooks/index';
import eventPusherStatus from './reducers/event-pusher-status/index';
import timeSegmentGroups from './reducers/time-segment-groups/index';
import dashboards from './reducers/dashboards/index';
import exploreData from './reducers/explore-data/index';
import miscellaneous from './reducers/miscellaneous/index';
const reducer = combineReducers({
  accountForgotPassword,
  accountRegistration,
  activeModal,
  activePage,
  doorways,
  links,
  sessionToken,
  spaces,
  tokens,
  user,
  webhooks,
  eventPusherStatus,
  timeSegmentGroups,
  dashboards,
  exploreData,
  miscellaneous,
});

// Create our redux store for storing the application state.
export default () => createStore(reducer, {}, compose(
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
));
