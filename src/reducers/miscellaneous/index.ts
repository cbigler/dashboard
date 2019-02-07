import moment from 'moment';
import uuid from 'uuid';

import { REDIRECT_AFTER_LOGIN } from '../../actions/miscellaneous/redirect-after-login';
import { CHANGE_DASHBOARD_DATE } from '../../actions/miscellaneous/change-dashboard-date';
import { SHOW_DASHBOARDS_SIDEBAR } from '../../actions/miscellaneous/show-dashboards-sidebar';
import { HIDE_DASHBOARDS_SIDEBAR } from '../../actions/miscellaneous/hide-dashboards-sidebar';
import { RESET_DASHBOARD_REPORT_GRID_IDENTITY_VALUE } from '../../actions/miscellaneous/reset-dashboard-report-grid-identity-value';

const initialState = {
  redirectAfterLogin: null,
  dashboardDate: moment().startOf('week').format('YYYY-MM-DD'),
  dashboardSidebarVisible: true,
  dashboardReportGridIdentityValue: uuid.v4(),
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
    case RESET_DASHBOARD_REPORT_GRID_IDENTITY_VALUE:
      return { ...state, dashboardReportGridIdentityValue: uuid.v4() };
    case CHANGE_DASHBOARD_DATE:
      return { ...state, dashboardDate: shiftDateByWeeks(state, action.weeks) };
    default:
      return state;
  }
}
