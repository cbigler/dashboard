import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { DASHBOARDS_SET } from '../../rx-actions/dashboards/set';
import { DASHBOARDS_SET_DATA } from '../../rx-actions/dashboards/set-data';
import { DASHBOARDS_PUSH } from '../../rx-actions/dashboards/push';
import { DASHBOARDS_ERROR } from '../../rx-actions/dashboards/error';
import { DASHBOARDS_SELECT } from '../../rx-actions/dashboards/select';
import { DASHBOARDS_UPDATE } from '../../rx-actions/dashboards/update';
import { DASHBOARDS_DESTROY } from '../../rx-actions/dashboards/destroy';
import { ROUTE_TRANSITION_DASHBOARD_LIST } from '../../rx-actions/route-transition/dashboard-list';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../rx-actions/route-transition/dashboard-detail';
import { ROUTE_TRANSITION_DASHBOARD_EDIT } from '../../rx-actions/route-transition/dashboard-edit';

import { DASHBOARDS_REPORT_DELETE } from '../../rx-actions/dashboards/report-delete';
import { DASHBOARDS_REPORT_CREATE } from '../../rx-actions/dashboards/report-create';

import {
  DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
  DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
  DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED,
  DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR,
  DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA,
} from '../../rx-actions/dashboards/calculate-report-data';

import { DASHBOARDS_UPDATE_FORM_STATE } from '../../rx-actions/dashboards/update-form-state';

import { DensityDashboard } from '../../types';
import createRxStore from '..';


// FIXME: the amount of uncertainty in this type is staggering
export type DashboardsState = {
  loading: boolean,
  selected: DensityDashboard['id'] | null,
  error: unknown,
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  data: DensityDashboard[],
  calculatedReportData: {
    [reportId: string]: {
      state: 'LOADING' | 'UNAUTHORIZED' | 'NO_DATA' | 'ERROR' | 'COMPLETE',
      data: Any<FixInRefactor>
    }
  },
  formState: Any<FixInRefactor>,
  reportList: Any<FixInRefactor>[],
  timeSegmentLabels: Any<FixInRefactor>[],
}

const initialState: DashboardsState = {
  loading: true,
  selected: null,
  error: null,
  view: 'LOADING',
  data: [] as Array<DensityDashboard>,
  calculatedReportData: {
    /*
    'rpt_456': {
      'state': 'LOADING',
      'data': null,
    }
    */
  },
  formState: {
    id: undefined,
  },
  reportList: [],
  timeSegmentLabels: [],
};


// FIXME: action should be GlobalAction
export function dashboardsReducer(state: DashboardsState, action: Any<FixInRefactor>): DashboardsState {
  switch (action.type) {

  // When the active page changes, reset the state of all reports to be at the loading state,
  // removing all of their previously stored data.
  case ROUTE_TRANSITION_DASHBOARD_DETAIL: {
    const allReports = state.data.reduce((acc, dashboard: any) => [...acc, ...dashboard.reportSet], [] as any);
    return {
      ...state,
      selected: action.dashboardId,
      calculatedReportData: {
        // All reports will be put into a loading state.
        ...(allReports.reduce((acc, report) => ({
          ...acc,
          [report.id]: {
            state: 'LOADING',
            data: null,
          },
        }), {})),
      },
    };
  }

  case ROUTE_TRANSITION_DASHBOARD_LIST: {
    return { ...state, loading: true, view: 'LOADING' };
  }

  case ROUTE_TRANSITION_DASHBOARD_EDIT:
    return { ...state, selected: action.dashboardId, loading: true, view: 'LOADING' };

  case DASHBOARDS_UPDATE:
    return { ...state, loading: true, view: 'LOADING' };

  // Update the whole dashboard collection.
  case DASHBOARDS_SET: {
    const allReports = action.data.reduce((acc, dashboard) => [...acc, ...dashboard.reportSet], []);
    return {
      ...state,
      loading: false,
      error: null,
      view: 'VISIBLE',
      data: action.data.map(d => objectSnakeToCamel<DensityDashboard>(d)),
      calculatedReportData: {
        // Any reports that don't have data loaded yet will be put into a loading state.
        ...(allReports.reduce((acc, report) => ({
          ...acc,
          [report.id]: {
            state: 'LOADING',
            data: null,
          },
        }), {})),

        // But if a report already has data loaded, have that override so that we don't refetch data
        // for reports that already have had their data fetched.
        ...state.calculatedReportData,
      },
    };
  }

  case DASHBOARDS_SET_DATA: {
    return {
      ...state,
      loading: false,
      error: null,
      view: 'VISIBLE',
      data: [objectSnakeToCamel<DensityDashboard>(action.dashboard)],
      calculatedReportData: {
        // Any reports that don't have data loaded yet will be put into a loading state.
        ...(action.dashboard.reportSet.reduce((acc, report) => ({
          ...acc,
          [report.id]: {
            state: 'LOADING',
            data: null,
          },
        }), {})),

        // But if a report already has data loaded, have that override so that we don't refetch data
        // for reports that already have had their data fetched.
        ...state.calculatedReportData,
      },
      formState: action.dashboard,
      reportList: action.reportList,
      timeSegmentLabels: action.timeSegmentLabels,
    };
  }

  case DASHBOARDS_PUSH: {
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.item.id === item.id) {
          return {...item, ...objectSnakeToCamel<DensityDashboard>(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel<DensityDashboard>(action.item)] :
            []
        ),
      ],
    };
  }

  case DASHBOARDS_DESTROY: {
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      selected: state.selected === action.dashboard.id ? null : state.selected,
      data: state.data.filter((item: any) => item.id !== action.dashboard.id),
      formState: state.formState.id === action.dashboard.id ? {} : state.formState,
    };
  }

  // Select a new dashboard
  case DASHBOARDS_SELECT:
    return {
      ...state,
      selected: action.dashboard.id,
    };

  // If report data calculation is successful, add the calculated data into the context for each
  // report.
  case DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE:
    return {
      ...state,
      calculatedReportData: {
        ...state.calculatedReportData,
        [action.report.id]: {
          state: 'COMPLETE',
          data: action.data,
          error: null,
        },
      },
    };

  // If report data calculation fails, add the error received during the calculation into the
  // context for each report.
  case DASHBOARDS_CALCULATE_REPORT_DATA_ERROR:
    return {
      ...state,
      calculatedReportData: {
        ...state.calculatedReportData,
        [action.report.id]: {
          state: 'ERROR',
          data: null,
          error: action.error,
        },
      },
    };

  // If report space has no data yet since it is too new, put it in 'NO_DATA' state
  case DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA:
    return {
      ...state,
      calculatedReportData: {
        ...state.calculatedReportData,
        [action.report.id]: {
          state: 'NO_DATA',
          data: null,
        },
      },
    };

  // If user is not authorized to view report, put it in 'UNAUTHORIZED' state
  case DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED:
    return {
      ...state,
      calculatedReportData: {
        ...state.calculatedReportData,
        [action.report.id]: {
          state: 'UNAUTHORIZED',
          data: null,
        },
      },
    };

  // Reset the state for a report back to loading
  case DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR:
    return {
      ...state,
      calculatedReportData: {
        ...state.calculatedReportData,
        [action.reportId]: {
          state: 'LOADING',
          data: null,
        },
      },
    };

  // An error occurred.
  case DASHBOARDS_ERROR:
    return { ...state, loading: false, error: action.error, view: 'ERROR' };

  // Utilized by the dashboard edit page as a place to store the state of the form
  case DASHBOARDS_UPDATE_FORM_STATE:
    return {
      ...state,
      formState: {
        ...state.formState,
        [action.key]: action.value,
      },
    };

  case DASHBOARDS_REPORT_DELETE:
    return { ...state, reportList: state.reportList.filter((r: any) => r.id !== action.reportId)};
  case DASHBOARDS_REPORT_CREATE:
    return { ...state, reportList: [...state.reportList, action.report]};

  default:
    return state;
  }
}

const DashboardsStore = createRxStore('DashboardsStore', initialState, dashboardsReducer);
export default DashboardsStore;