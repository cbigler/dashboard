import getInObject from 'lodash/get';

import { DensityUser } from "../../types";
import { DayOfWeek } from '../../types/datetime';
import { DashboardsState } from '../../rx-stores/dashboards';
import { UserState } from "../../rx-stores/user";


export function getUserOrgSettings(user: UserState): DensityUser['organization']['settings'] {
  const settings = getInObject(user, ['data', 'organization', 'settings'], {});
  return settings;
}

export function getUserDashboardWeekStart(user: UserState): DayOfWeek {
  const settings = getUserOrgSettings(user)
  const dashboardWeekStart = getInObject(settings, 'dashboardWeekStart', 'Sunday') as DayOfWeek;
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
