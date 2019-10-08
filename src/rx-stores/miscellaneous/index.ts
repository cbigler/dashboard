import moment from 'moment';

import { REDIRECT_AFTER_LOGIN } from '../../rx-actions/miscellaneous/redirect-after-login';
import { SHOW_DASHBOARDS_SIDEBAR } from '../../rx-actions/miscellaneous/show-dashboards-sidebar';
import { HIDE_DASHBOARDS_SIDEBAR } from '../../rx-actions/miscellaneous/hide-dashboards-sidebar';
import { SET_DASHBOARD_DATE, SCRUB_DASHBOARD_DATE } from '../../rx-actions/miscellaneous/set-dashboard-date';
import createRxStore from '..';


export type MiscellaneousState = {
  redirectAfterLogin: string | null,
  dashboardDate: Any<FixInRefactor>,
  dashboardSidebarVisible: boolean,
}

const getCurrentDate = () => moment().format('YYYY-MM-DD')

export const initialState: MiscellaneousState = {
  redirectAfterLogin: null,
  dashboardDate: getCurrentDate(),
  dashboardSidebarVisible: true,
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
      // NOTE: skipping all direct updates of dashboard date for now
      return state;
    case SCRUB_DASHBOARD_DATE:
      // NOTE: scrubbing still affects dashboard date (this is only for one customer)
      return { ...state, dashboardDate: shiftDateByWeeks(state, action.weeks) };
    default:
      return state;
  }
}

const MiscellaneousStore = createRxStore('MiscellaneousStore', initialState, miscellaneousReducer);
export default MiscellaneousStore;
