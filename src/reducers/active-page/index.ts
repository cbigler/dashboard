import { ROUTE_TRANSITION_LOGIN } from '../../actions/route-transition/login';
import { ROUTE_TRANSITION_EXPLORE } from '../../actions/route-transition/explore';
import { ROUTE_TRANSITION_LIVE_SPACE_LIST } from '../../actions/route-transition/live-space-list';
import { ROUTE_TRANSITION_LIVE_SPACE_DETAIL } from '../../actions/route-transition/live-space-detail';
import { ROUTE_TRANSITION_ACCOUNT } from '../../actions/route-transition/account';
import { ROUTE_TRANSITION_ACCOUNT_REGISTER } from '../../actions/route-transition/account-register';
import { ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD } from '../../actions/route-transition/account-forgot-password';
import { ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS } from '../../actions/route-transition/explore-space-trends';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DAILY } from '../../actions/route-transition/explore-space-daily';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT } from '../../actions/route-transition/explore-space-data-export';
import { ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS } from '../../actions/route-transition/explore-space-meetings';

import { ROUTE_TRANSITION_ACCOUNT_SETUP_OVERVIEW } from '../../actions/route-transition/account-setup-overview';
import { ROUTE_TRANSITION_ACCOUNT_SETUP_DOORWAY_LIST } from '../../actions/route-transition/account-setup-doorway-list';
import { ROUTE_TRANSITION_ACCOUNT_SETUP_DOORWAY_DETAIL } from '../../actions/route-transition/account-setup-doorway-detail';

import { ROUTE_TRANSITION_DASHBOARD_LIST } from '../../actions/route-transition/dashboard-list';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../actions/route-transition/dashboard-detail';

import { ROUTE_TRANSITION_ADMIN_INTEGRATIONS } from '../../actions/route-transition/admin-integrations';
import { ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT } from '../../actions/route-transition/admin-user-management';
import { ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL } from '../../actions/route-transition/admin-user-management-detail';
import { ROUTE_TRANSITION_ADMIN_DEVELOPER } from '../../actions/route-transition/admin-developer';
import { ROUTE_TRANSITION_ADMIN_DEVICE_STATUS } from '../../actions/route-transition/admin-device-status';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from '../../actions/route-transition/admin-locations';

import { ROUTE_TRANSITION_LOGOUT } from '../../actions/route-transition/logout';

const initialState = "BLANK";

export default function activePage(state=initialState, action) {
  switch (action.type) {
  case ROUTE_TRANSITION_LOGIN:
    return "LOGIN";

  case ROUTE_TRANSITION_LIVE_SPACE_LIST:
    return "LIVE_SPACE_LIST";
  case ROUTE_TRANSITION_LIVE_SPACE_DETAIL:
    return "LIVE_SPACE_DETAIL";
  case ROUTE_TRANSITION_EXPLORE:
    return "EXPLORE";
  case ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS:
    return "EXPLORE_SPACE_TRENDS";
  case ROUTE_TRANSITION_EXPLORE_SPACE_DAILY:
    return "EXPLORE_SPACE_DAILY";
  case ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT:
    return "EXPLORE_SPACE_DATA_EXPORT";
  case ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS:
    return "EXPLORE_SPACE_MEETINGS";

  case ROUTE_TRANSITION_ACCOUNT:
    return "ACCOUNT";
  case ROUTE_TRANSITION_ACCOUNT_REGISTER:
    return "ACCOUNT_REGISTRATION";
  case ROUTE_TRANSITION_ACCOUNT_FORGOT_PASSWORD:
    return "ACCOUNT_FORGOT_PASSWORD";

  // Onboarding pages
  case ROUTE_TRANSITION_ACCOUNT_SETUP_OVERVIEW:
    return "ACCOUNT_SETUP_OVERVIEW";
  case ROUTE_TRANSITION_ACCOUNT_SETUP_DOORWAY_LIST:
    return "ACCOUNT_SETUP_DOORWAY_LIST";
  case ROUTE_TRANSITION_ACCOUNT_SETUP_DOORWAY_DETAIL:
    return "ACCOUNT_SETUP_DOORWAY_DETAIL";

  case ROUTE_TRANSITION_DASHBOARD_LIST:
    return "DASHBOARD_LIST";
  case ROUTE_TRANSITION_DASHBOARD_DETAIL:
    return "DASHBOARD_DETAIL";

  case ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT:
    return "ADMIN_USER_MANAGEMENT";
  case ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL:
    return "ADMIN_USER_MANAGEMENT_DETAIL";
  case ROUTE_TRANSITION_ADMIN_DEVELOPER:
    return "ADMIN_DEVELOPER";
  case ROUTE_TRANSITION_ADMIN_DEVICE_STATUS:
    return "ADMIN_DEVICE_STATUS";
  case ROUTE_TRANSITION_ADMIN_INTEGRATIONS:
    return "ADMIN_INTEGRATIONS";
  case ROUTE_TRANSITION_ADMIN_LOCATIONS:
    return "ADMIN_LOCATIONS";

  // When logging out, navigate to this page (it's empty) to ensure that removing things like the
  // token doesn't cause weird stuff in components that expect it to exist.
  case ROUTE_TRANSITION_LOGOUT:
    return "LOGOUT";

  default:
    return state;
  }
}
