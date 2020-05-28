import moment from 'moment-timezone';

import { REDIRECT_AFTER_LOGIN } from '../../rx-actions/miscellaneous/redirect-after-login';
import { ROUTE_TRANSITION_LOGIN_ERROR } from '../../rx-actions/route-transition/login-error';
import { SHOW_DASHBOARDS_SIDEBAR } from '../../rx-actions/miscellaneous/show-dashboards-sidebar';
import { HIDE_DASHBOARDS_SIDEBAR } from '../../rx-actions/miscellaneous/hide-dashboards-sidebar';
import { SET_DASHBOARD_DATE, SCRUB_DASHBOARD_DATE } from '../../rx-actions/miscellaneous/set-dashboard-date';
import createRxStore from '..';


export type MiscellaneousState = {
  redirectAfterLogin: string | null,
  dashboardDate: Any<FixInRefactor>,
  dashboardSidebarVisible: boolean,
  loginError: string | null,
}

export const initialState: MiscellaneousState = {
  redirectAfterLogin: null,
  dashboardDate: null,
  dashboardSidebarVisible: true,
  loginError: null,
};

function shiftDateByWeeks(state, weeks) {
  return moment(state.dashboardDate).add(weeks, 'week').format('YYYY-MM-DD');
}

// FIXME: action should be GlobalAction
export function miscellaneousReducer(state: MiscellaneousState, action: Any<FixInRefactor>) {
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
    case ROUTE_TRANSITION_LOGIN_ERROR:
      return { ...state, loginError: action.error };
    default:
      return state;
  }
}

const MiscellaneousStore = createRxStore('MiscellaneousStore', initialState, miscellaneousReducer);
export default MiscellaneousStore;
