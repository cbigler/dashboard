// Redux is used to manage state.
import {createStore, compose, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';

// Assemble all parts of the reducer
import accountForgotPassword from './reducers/account-forgot-password/index';
import accountRegistration from './reducers/account-registration/index';
import activeModal from './reducers/active-modal/index';
import activePage from './reducers/active-page/index';
import alerts from './reducers/alerts/index';
import toasts from'./reducers/toasts/index';
import sessionToken from './reducers/session-token/index';
import spaces from './reducers/spaces/index';
import spaceHierarchy from './reducers/space-hierarchy/index';
import spaceReports from './reducers/space-reports/index';
import tokens from './reducers/tokens/index';
import user from './reducers/user/index';
import impersonate from './reducers/impersonate/index';
import sensors from './reducers/sensors/index';
import webhooks from './reducers/webhooks/index';
import eventPusherStatus from './reducers/event-pusher-status/index';
import dashboards from './reducers/dashboards/index';
import exploreData from './reducers/explore-data/index';
import resizeCounter from './reducers/resize-counter/index';
import users from './reducers/users/index';
import digestSchedules from './reducers/digest-schedules/index';
import miscellaneous from './reducers/miscellaneous/index';
import integrations from './reducers/integrations/index';
import spaceManagement from './reducers/space-management/index';
import tags from './reducers/tags/index';
import assignedTeams from './reducers/assigned-teams/index';

const reducer = combineReducers({
  accountForgotPassword,
  accountRegistration,
  activeModal,
  activePage,
  alerts,
  toasts,
  sessionToken,
  spaces,
  spaceHierarchy,
  spaceReports,
  tokens,
  sensors,
  user,
  impersonate,
  webhooks,
  eventPusherStatus,
  dashboards,
  exploreData,
  resizeCounter,
  users,
  digestSchedules,
  miscellaneous,
  integrations,
  spaceManagement,
  tags,
  assignedTeams,
});

// Create our redux store for storing the application state.
export default () => createStore(reducer, {}, compose(
  applyMiddleware(thunk),
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ ?
    (window as any).__REDUX_DEVTOOLS_EXTENSION__() : f => f
));
