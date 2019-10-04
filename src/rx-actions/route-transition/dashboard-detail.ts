import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import dashboardsSet from '../dashboards/set';
import dashboardsError from '../dashboards/error';
import dashboardsSelect from '../dashboards/select';

import collectionDigestSchedulesSet from '../collection/digest-schedules/set';
import collectionDigestSchedulesError from '../collection/digest-schedules/error';
import setDashboardDate from '../miscellaneous/set-dashboard-date';

import { getStartOfWeek } from '../../helpers/space-time-utilities';

import { DensityDashboard, DensityDigestSchedule } from '../../types';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import UserStore from '../../rx-stores/user';
import DashboardsStore from '../../rx-stores/dashboards';
import MiscellaneousStore from '../../rx-stores/miscellaneous';


export const ROUTE_TRANSITION_DASHBOARD_DETAIL = 'ROUTE_TRANSITION_DASHBOARD_DETAIL';

async function loadDigestSchedules(dispatch) {
  let schedules, errorThrown;
  try {
    schedules = await fetchAllObjects<DensityDigestSchedule>('/digest_schedules');
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

// Determine "start of week" for this organization and the dashboard date
export async function calculateDashboardDate(dispatch, dashboardWeekStart) {
  // FIXME: imperative get state
  const miscellaneous = MiscellaneousStore.imperativelyGetValue();
  const dashboardDate = getStartOfWeek(
    moment(miscellaneous.dashboardDate || undefined),
    dashboardWeekStart
  ).format('YYYY-MM-DD');
  dispatch(setDashboardDate(dashboardDate));
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

  // Determine "start of week" for this organization and the dashboard date
  const dashboardWeekStart = user.organization.settings.dashboardWeekStart;
  await calculateDashboardDate(dispatch, dashboardWeekStart);
  // FIXME: imperative get state
  const miscellaneous = MiscellaneousStore.imperativelyGetValue();
  const dashboardDate = miscellaneous.dashboardDate;

  // FIXME: need to imperatively get the state for now...
  const dashboardsState = DashboardsStore.imperativelyGetValue();
  // First, if the dashboard already is in the collection, then immediately select it.
  let selectedDashboard: Any<FixInRefactor> = dashboardsState.data.find(d => d.id === id);
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

  let dashboards;
  try {
    dashboards = await fetchAllObjects<DensityDashboard>('/dashboards');
  } catch (err) {
    dispatch(dashboardsError(err));
    return;
  }

  const results = dashboards.map(d => objectSnakeToCamel<DensityDashboard>(d));
  dispatch(dashboardsSet(results));

  if (results.length === 0) {
    return;
  }

  // Now, if the dashboard to be selected hasn't already been selected (optimistically, at the top
  // of the function), then select it now that it has been loaded.
  if (!selectedDashboard) {
    selectedDashboard = results.find(dashboard => dashboard.id === id);
    if (!selectedDashboard) {
      dispatch(dashboardsError('No dashboard with this id was found.'))
      return;
    } else {
      dashboards = dashboards.map(d => objectSnakeToCamel<DensityDashboard>(d));
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
        selectedDashboard = fetchObject<DensityDashboard>(`/dashboards/${id}`);
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
  dispatch({ type: ROUTE_TRANSITION_DASHBOARD_DETAIL, dashboardId: id });

  await Promise.all([
    loadDigestSchedules(dispatch),
    loadDashboardAndReports(dispatch, id),
  ])
}
