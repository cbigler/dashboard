import moment from 'moment';

import dashboardsSet from '../dashboards/set';
import dashboardsError from '../dashboards/error';
import dashboardsSelect from '../dashboards/select';

import collectionDigestSchedulesSet from '../collection/digest-schedules/set';
import collectionDigestSchedulesError from '../collection/digest-schedules/error';
import setDashboardDate from '../miscellaneous/set-dashboard-date';

import { DensityDashboard, DensityDigestSchedule } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import UserStore from '../../rx-stores/user';
import DashboardsStore from '../../rx-stores/dashboards';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import { sanitizeReportSettings } from '../../helpers/casing';


export const ROUTE_TRANSITION_DASHBOARD_DETAIL = 'ROUTE_TRANSITION_DASHBOARD_DETAIL';

async function loadDigestSchedules(dispatch) {
  let schedules, errorThrown;
  try {
    schedules = await fetchAllObjects<DensityDigestSchedule>('/digest_schedules', { cache: false });
  } catch (err) {
    errorThrown = err;
  }
  if (!errorThrown) {
    dispatch(collectionDigestSchedulesSet(schedules));
  } else {
    console.error(errorThrown);
    dispatch(collectionDigestSchedulesError(errorThrown));
  }
}

async function loadDashboardAndReports(dispatch, id) {
  let dashboardSelectionPromise;
 

  // FIXME: defer fixing to when we address data access layer
  const userState = UserStore.imperativelyGetValue();

  const user = userState.data;

  // FIXME: this shouldn't be possible, but need to check for now, fix later
  if (!user) {
    throw new Error('User data not available')
  }

  // Determine "start of week" for this organization
  const dashboardWeekStart = user.organization.settings.dashboard_week_start;
  
  // FIXME: imperative get state
  const miscellaneous = MiscellaneousStore.imperativelyGetValue();
  const dashboardDate = moment(miscellaneous.dashboardDate || undefined).format('YYYY-MM-DD');

  // FIXME: need to imperatively get the state for now...
  const dashboardsState = DashboardsStore.imperativelyGetValue();
  // First, if the dashboard already is in the collection, then immediately select it.
  let selectedDashboard: DensityDashboard | undefined = dashboardsState.data.find(d => d.id === id);
  if (selectedDashboard) {
    // The data for the dashboard being selected already exists, so don't "reset the state" as
    // this will show a loading state / remove all dashboards that are already in the collection
    // and that's not desired.
    dashboardSelectionPromise = dashboardsSelect(
      dispatch,
      selectedDashboard,
      dashboardDate,
      dashboardWeekStart
    );
  }

  // Though this route is only to load a single dashboard, we need to load all dashboards in order
  // to render the list on the left side of the screen.
  //
  // So, next, load all dashboards. Even if all dashboards are set, loading them again isn't a bad
  // idea and ensures we have up to date data.

  let dashboards: Array<DensityDashboard>;
  try {
    dashboards = await fetchAllObjects<DensityDashboard>('/dashboards', { cache: false });
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  // TODO: sanitize report settings, because we have saved reports with mixed/inconsistent casing
  dashboards.forEach(dashboard => {
    dashboard.report_set = dashboard.report_set.map(r => sanitizeReportSettings(r));
  });

  dispatch(dashboardsSet(dashboards));

  if (dashboards.length === 0) {
    return;
  }

  // Now, if the dashboard to be selected hasn't already been selected (optimistically, at the top
  // of the function), then select it now that it has been loaded.
  if (!selectedDashboard) {
    selectedDashboard = dashboards.find(dashboard => dashboard.id === id);
    if (!selectedDashboard) {
      dispatch(dashboardsError('No dashboard with this id was found.'))
      return;
    }

    // Load the selected dashboard directly, in case it is hidden
    selectedDashboard = dashboards.find(d => d.id === id);
    if (selectedDashboard) {
      dispatch(dashboardsSet(dashboards));
      dashboardSelectionPromise = dashboardsSelect(
        dispatch,
        selectedDashboard,
        dashboardDate,
        dashboardWeekStart
      );
    } else {
      try {
        selectedDashboard = await fetchObject<DensityDashboard>(`/dashboards/${id}`, { cache: false });
        // TODO: sanitize report settings, because we have saved reports with mixed/inconsistent casing
        selectedDashboard.report_set = selectedDashboard.report_set.map(r => sanitizeReportSettings(r));
      } catch (err) {
        dispatch(dashboardsError(err));
        return;
      }
      if (!selectedDashboard) {
        console.warn('Do the equivelent of a 404 not found type of error here');
        return;
      }
      dashboards.push(selectedDashboard);
      dispatch(dashboardsSet(dashboards));
      dashboardSelectionPromise = dashboardsSelect(
        dispatch,
        selectedDashboard,
        dashboardDate,
        dashboardWeekStart
      );
    }
  }

  // Wait for the dashboard selection to complete
  await dashboardSelectionPromise;
}

export default async function routeTransitionDashboardDetail(dispatch, id) {
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_DETAIL, dashboard_id: id });

  await Promise.all([
    loadDigestSchedules(dispatch),
    loadDashboardAndReports(dispatch, id),
  ])
}
