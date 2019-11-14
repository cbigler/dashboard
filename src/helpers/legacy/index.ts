import getInObject from 'lodash/get';

import { UserState } from "../../rx-stores/user";
import { DaysOfWeek, DensityUser } from "../../types";
import { DashboardsState } from '../../rx-stores/dashboards';


export function getUserOrgSettings(user: UserState): DensityUser['organization']['settings'] {
  const settings = getInObject(user, ['data', 'organization', 'settings'], {});
  return settings;
}

export function getUserDashboardWeekStart(user: UserState): DaysOfWeek {
  const settings = getUserOrgSettings(user)
  const dashboardWeekStart = getInObject(settings, 'dashboardWeekStart', 'Sunday') as DaysOfWeek;
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
