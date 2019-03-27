import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import collectionDashboardsSet from '../collection/dashboards/set';
import collectionDashboardsError from '../collection/dashboards/error';
import collectionDashboardsSelect from '../collection/dashboards/select';
import dashboardsError from '../collection/dashboards/error';
import core from '../../client/core';
import accounts from '../../client/accounts';

import collectionDispatchSchedulesSet from '../collection/digest-schedules/set';
import collectionDispatchSchedulesError from '../collection/digest-schedules/error';
import setDashboardDate from '../miscellaneous/set-dashboard-date';

import fetchAllPages from '../../helpers/fetch-all-pages/index';
import { getStartOfWeek } from '../../helpers/space-time-utilities';

import { DensityDashboard, DensityDigestSchedule } from '../../types';


export const ROUTE_TRANSITION_DASHBOARD_DETAIL = 'ROUTE_TRANSITION_DASHBOARD_DETAIL';

function loadDigestSchedules() {
  return async dispatch => {
    let schedules, errorThrown;
    try {
      schedules = (await fetchAllPages(async page => {
        return (await core().get(`/digest_schedules?page=${page}&page_size=5000`)).data;
      })).map(d => objectSnakeToCamel<DensityDigestSchedule>(d));
    } catch (err) {
      errorThrown = err;
    }
    if (!errorThrown) {
      dispatch(collectionDispatchSchedulesSet(schedules));
    } else {
      console.error(errorThrown);
      dispatch(collectionDispatchSchedulesError(errorThrown));
    }
  }
}

// Determine "start of week" for this organization and the dashboard date
export function calculateDashboardDate(dashboardWeekStart) {
  return async (dispatch, getState) => {
    const state = getState();
    const dashboardDate = getStartOfWeek(
      moment(state.miscellaneous.dashboardDate || undefined),
      dashboardWeekStart
    ).format('YYYY-MM-DD');
    dispatch(setDashboardDate(dashboardDate));
  }
}

function loadDashboardAndReports(id) {
  return async (dispatch, getState) => {
    let dashboardSelectionPromise;
    const state = getState();
    
    // Determine "start of week" for this organization and the dashboard date
    const dashboardWeekStart = state.user.data.organization.settings.dashboardWeekStart;
    dispatch(calculateDashboardDate(dashboardWeekStart));
    const dashboardDate = getState().miscellaneous.dashboardDate;

    // First, if the dashboard already is in the collection, then immediately select it.
    let selectedDashboard = state.dashboards.data.find(d => d.id === id);
    if (selectedDashboard) {
      // The data for the dashboard being selected already exists, so don't "reset the state" as
      // this will show a loading state / remove all dashboards that are already in the collection
      // and that's not desired.
      dashboardSelectionPromise = dispatch(
        collectionDashboardsSelect(selectedDashboard, dashboardDate, dashboardWeekStart)
      );
    }

    // Though this route is only to load a single dashboard, we need to load all dashboards in order
    // to render the list on the left side of the screen.
    //
    // So, next, load all dashboards. Even if all dashboards are set, loading them again isn't a bad
    // idea and ensures we have up to date data.

    let dashboards;
    try {
      dashboards = await fetchAllPages(async page => (
        (await core().get('/dashboards', {params: {page, page_size: 5000}})).data
      ));
    } catch (err) {
      dispatch(collectionDashboardsError(err));
      return;
    }

    const results = dashboards.map(d => objectSnakeToCamel<DensityDashboard>(d));
    dispatch(collectionDashboardsSet(results));

    if (results.length === 0) {
      dispatch(dashboardsError('No dashboards were found, please talk to your Density account representative to create one.'))
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
        dispatch(collectionDashboardsSet(dashboards));
        dashboardSelectionPromise = dispatch(
          collectionDashboardsSelect(selectedDashboard, dashboardDate, dashboardWeekStart)
        );
      } else {
        try {
        selectedDashboard = objectSnakeToCamel<DensityDashboard>((await core().get(`/dashboards/${id}`)).data);
        } catch (err) {
          dispatch(collectionDashboardsError(err));
          return;
        }
        if (!selectedDashboard) {
          console.warn('Do the equivelent of a 404 not found type of error here');
          return;
        }
        dashboards.push(selectedDashboard);
        dispatch(collectionDashboardsSet(dashboards));
        dashboardSelectionPromise = dispatch(
          collectionDashboardsSelect(selectedDashboard, dashboardDate, dashboardWeekStart)
        );
      }
    }

    // Wait for the dashboard selection to complete
    await dashboardSelectionPromise;
  }
}

export default function routeTransitionDashboardDetail(id) {
  return async dispatch => {
    dispatch({ type: ROUTE_TRANSITION_DASHBOARD_DETAIL });

    await Promise.all([
      dispatch(loadDigestSchedules()),
      dispatch(loadDashboardAndReports(id)),
    ]);
  };
}
