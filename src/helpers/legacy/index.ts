import getInObject from 'lodash/get';

import { DayOfWeek } from '@density/lib-common-types';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
import { DashboardsState } from '../../rx-stores/dashboards';
import { UserState } from "../../rx-stores/user";


export function getUserOrgSettings(user: UserState): CoreUser['organization']['settings'] {
  const settings = getInObject(user, ['data', 'organization', 'settings'], {});
  return settings;
}

export function getUserDashboardWeekStart(user: UserState): DayOfWeek {
  const settings = getUserOrgSettings(user)
  const dashboardWeekStart = getInObject(settings, 'dashboard_week_start', 'Sunday') as DayOfWeek;
  return dashboardWeekStart;
}

export function getIsReadOnlyUser(user: UserState): boolean {
  const permissions = getInObject(user, ['data', 'permissions'], []);
  return !(Boolean(permissions.includes('core_write')))
}

export function getSelectedDashboard(dashboards: DashboardsState) {
  const selectedDashboard = dashboards.data.find(d => d.id === dashboards.selected);
  return selectedDashboard;
}
