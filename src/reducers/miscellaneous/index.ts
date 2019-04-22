import moment from 'moment';

import { REDIRECT_AFTER_LOGIN } from '../../actions/miscellaneous/redirect-after-login';
import { SHOW_DASHBOARDS_SIDEBAR } from '../../actions/miscellaneous/show-dashboards-sidebar';
import { HIDE_DASHBOARDS_SIDEBAR } from '../../actions/miscellaneous/hide-dashboards-sidebar';
import { SET_DASHBOARD_DATE, SCRUB_DASHBOARD_DATE } from '../../actions/miscellaneous/set-dashboard-date';
import { SET_NEW_SPACE_TYPE } from '../../actions/miscellaneous/set-new-space-type';
import { SET_NEW_SPACE_PARENT_ID } from '../../actions/miscellaneous/set-new-space-parent-id';

const initialState = {
  redirectAfterLogin: null,
  dashboardDate: null,
  dashboardSidebarVisible: true,
};

function shiftDateByWeeks(state, weeks) {
  return moment(state.dashboardDate).add(weeks, 'week').format('YYYY-MM-DD');
}

export default function miscellaneous(state=initialState, action) {
  switch (action.type) {
    case REDIRECT_AFTER_LOGIN:
      return { ...state, redirectAfterLogin: action.hash };
    case SHOW_DASHBOARDS_SIDEBAR:
      return { ...state, dashboardSidebarVisible: true };
    case HIDE_DASHBOARDS_SIDEBAR:
      return { ...state, dashboardSidebarVisible: false };
    case SET_DASHBOARD_DATE:
      return { ...state, dashboardDate: action.date };
    case SCRUB_DASHBOARD_DATE:
      return { ...state, dashboardDate: shiftDateByWeeks(state, action.weeks) };
    case SET_NEW_SPACE_TYPE:
      return { ...state, adminLocationsNewSpaceType: action.newSpaceType };
    case SET_NEW_SPACE_PARENT_ID:
      return { ...state, adminLocationsNewSpaceParentId: action.newSpaceParentId };
    default:
      return state;
  }
}
