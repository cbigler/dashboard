import { ROUTE_TRANSITION_LOGIN } from '../../rx-actions/route-transition/login';
import { ROUTE_TRANSITION_LOGIN_FORGOT_PASSWORD } from '../../rx-actions/route-transition/login-forgot-password';
import { ROUTE_TRANSITION_LOGIN_ERROR } from '../../rx-actions/route-transition/login-error';
import { ROUTE_TRANSITION_ACCOUNT } from '../../rx-actions/route-transition/account';
import { ROUTE_TRANSITION_LIVE_SPACE_LIST } from '../../rx-actions/route-transition/live-space-list';
import { ROUTE_TRANSITION_LIVE_SPACE_DETAIL } from '../../rx-actions/route-transition/live-space-detail';
import { ROUTE_TRANSITION_SPACES } from '../../rx-actions/route-transition/spaces';
import { ROUTE_TRANSITION_SPACES_SPACE } from '../../rx-actions/route-transition/spaces-space';
import { ROUTE_TRANSITION_SPACES_DOORWAY } from '../../rx-actions/route-transition/spaces-doorway';

import { ROUTE_TRANSITION_DASHBOARD_LIST } from '../../rx-actions/route-transition/dashboard-list';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../rx-actions/route-transition/dashboard-detail';
import { ROUTE_TRANSITION_DASHBOARD_EDIT } from '../../rx-actions/route-transition/dashboard-edit';

import { ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS } from '../../rx-actions/route-transition/admin-space-mappings';
import { ROUTE_TRANSITION_ADMIN_BRIVO_MAPPINGS } from '../../rx-actions/route-transition/admin-brivo-mappings';
import { ROUTE_TRANSITION_ADMIN_INTEGRATIONS } from '../../rx-actions/route-transition/admin-integrations';
import { ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT } from '../../rx-actions/route-transition/admin-user-management';
import { ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL } from '../../rx-actions/route-transition/admin-user-management-detail';
import { ROUTE_TRANSITION_ADMIN_DEVELOPER } from '../../rx-actions/route-transition/admin-developer';
import { ROUTE_TRANSITION_ADMIN_DEVICE_STATUS } from '../../rx-actions/route-transition/admin-device-status';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from '../../rx-actions/route-transition/admin-locations';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../rx-actions/route-transition/admin-locations-edit';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../rx-actions/route-transition/admin-locations-new';

import { QueueActionTypes } from '../../rx-actions/queue';

import { ROUTE_TRANSITION_LOGOUT } from '../../rx-actions/route-transition/logout';

import { AnalyticsActionType } from '../../rx-actions/analytics';
import { AccountActionTypes } from '../../types/account';
import createRxStore from '..';


export enum ActivePage {
  BLANK = 'BLANK',
  LOGIN = 'LOGIN',
  LOGIN_FORGOT_PASSWORD = 'LOGIN_FORGOT_PASSWORD',
  LOGIN_ERROR = 'LOGIN_ERROR',
  LOGOUT = 'LOGOUT',
  LIVE_SPACE_LIST = 'LIVE_SPACE_LIST',
  LIVE_SPACE_DETAIL = 'LIVE_SPACE_DETAIL',
  SPACES = 'SPACES',
  SPACES_SPACE = 'SPACES_SPACE',
  SPACES_DOORWAY = 'SPACES_DOORWAY',
  ACCOUNT = 'ACCOUNT',
  ACCOUNT_REGISTRATION = 'ACCOUNT_REGISTRATION',
  ACCOUNT_FORGOT_PASSWORD = 'ACCOUNT_FORGOT_PASSWORD',
  DASHBOARD_LIST = 'DASHBOARD_LIST',
  DASHBOARD_DETAIL = 'DASHBOARD_DETAIL',
  DASHBOARD_EDIT = 'DASHBOARD_EDIT',
  ADMIN_USER_MANAGEMENT = 'ADMIN_USER_MANAGEMENT',
  ADMIN_USER_MANAGEMENT_DETAIL = 'ADMIN_USER_MANAGEMENT_DETAIL',
  ADMIN_DEVELOPER = 'ADMIN_DEVELOPER',
  ADMIN_DEVICE_STATUS = 'ADMIN_DEVICE_STATUS',
  ADMIN_SPACE_MAPPINGS = 'ADMIN_SPACE_MAPPINGS',
  ADMIN_BRIVO_MAPPINGS = 'ADMIN_BRIVO_MAPPINGS',
  ADMIN_INTEGRATIONS = 'ADMIN_INTEGRATIONS',
  ADMIN_LOCATIONS = 'ADMIN_LOCATIONS',
  ADMIN_LOCATIONS_EDIT = 'ADMIN_LOCATIONS_EDIT',
  ADMIN_LOCATIONS_NEW = 'ADMIN_LOCATIONS_NEW',
  ANALYTICS = 'ANALYTICS',
  QUEUE_SPACE_LIST = 'QUEUE_SPACE_LIST',
  QUEUE_SPACE_DETAIL = 'QUEUE_SPACE_DETAIL',
}

export type ActivePageState = ActivePage;

const initialState = ActivePage.BLANK

// FIXME: action should be GlobalAction
export function activePageReducer(state: ActivePageState, action: Any<FixInRefactor>): ActivePageState {
  switch (action.type) {
  case ROUTE_TRANSITION_LOGIN:
    return ActivePage.LOGIN;
  case ROUTE_TRANSITION_LOGIN_FORGOT_PASSWORD:
    return ActivePage.LOGIN_FORGOT_PASSWORD;
  case ROUTE_TRANSITION_LOGIN_ERROR:
    return ActivePage.LOGIN_ERROR;

  case ROUTE_TRANSITION_LIVE_SPACE_LIST:
    return ActivePage.LIVE_SPACE_LIST;
  case ROUTE_TRANSITION_LIVE_SPACE_DETAIL:
    return ActivePage.LIVE_SPACE_DETAIL;

  case ROUTE_TRANSITION_SPACES:
    return ActivePage.SPACES;
  case ROUTE_TRANSITION_SPACES_SPACE:
    return ActivePage.SPACES_SPACE;
  case ROUTE_TRANSITION_SPACES_DOORWAY:
    return ActivePage.SPACES_DOORWAY;

  case ROUTE_TRANSITION_ACCOUNT:
    return ActivePage.ACCOUNT;
  case AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_REGISTER:
    return ActivePage.ACCOUNT_REGISTRATION;
  case AccountActionTypes.ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD:
    return ActivePage.ACCOUNT_FORGOT_PASSWORD;

  case ROUTE_TRANSITION_DASHBOARD_LIST:
    return ActivePage.DASHBOARD_LIST;
  case ROUTE_TRANSITION_DASHBOARD_DETAIL:
    return ActivePage.DASHBOARD_DETAIL;
  case ROUTE_TRANSITION_DASHBOARD_EDIT:
    return ActivePage.DASHBOARD_EDIT;

  case ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT:
    return ActivePage.ADMIN_USER_MANAGEMENT;
  case ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL:
    return ActivePage.ADMIN_USER_MANAGEMENT_DETAIL;
  case ROUTE_TRANSITION_ADMIN_DEVELOPER:
    return ActivePage.ADMIN_DEVELOPER;
  case ROUTE_TRANSITION_ADMIN_DEVICE_STATUS:
    return ActivePage.ADMIN_DEVICE_STATUS;
  case ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS:
    return ActivePage.ADMIN_SPACE_MAPPINGS;
  case ROUTE_TRANSITION_ADMIN_BRIVO_MAPPINGS:
    return ActivePage.ADMIN_BRIVO_MAPPINGS;
  case ROUTE_TRANSITION_ADMIN_INTEGRATIONS:
    return ActivePage.ADMIN_INTEGRATIONS;
  case ROUTE_TRANSITION_ADMIN_LOCATIONS:
    return ActivePage.ADMIN_LOCATIONS;
  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return ActivePage.ADMIN_LOCATIONS_EDIT;
  case ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW:
    return ActivePage.ADMIN_LOCATIONS_NEW;
  case QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL:
    return ActivePage.QUEUE_SPACE_DETAIL;
  case QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_LIST:
    return ActivePage.QUEUE_SPACE_LIST;

  case AnalyticsActionType.ROUTE_TRANSITION_ANALYTICS:
    return ActivePage.ANALYTICS;

  // When logging out, navigate to this page (it's empty) to ensure that removing things like the
  // token doesn't cause weird stuff in components that expect it to exist.
  case ROUTE_TRANSITION_LOGOUT:
    return ActivePage.LOGOUT;

  default:
    return state;
  }
}

const ActivePageStore = createRxStore('ActivePageStore', initialState, activePageReducer)

export default ActivePageStore;
