import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { DASHBOARDS_SET } from '../../actions/dashboards/set';
import { DASHBOARDS_SET_DATA } from '../../actions/dashboards/set-data';
import { DASHBOARDS_PUSH } from '../../actions/dashboards/push';
import { DASHBOARDS_ERROR } from '../../actions/dashboards/error';
import { DASHBOARDS_SELECT } from '../../actions/dashboards/select';
import { DASHBOARDS_UPDATE } from '../../actions/dashboards/update';
import { DASHBOARDS_DESTROY } from '../../actions/dashboards/destroy';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../actions/route-transition/dashboard-detail';
import { ROUTE_TRANSITION_DASHBOARD_EDIT } from '../../actions/route-transition/dashboard-edit';

import { DASHBOARDS_REPORT_DELETE } from '../../actions/dashboards/report-delete';
import { DASHBOARDS_REPORT_CREATE } from '../../actions/dashboards/report-create';

import {
  DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
  DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
  DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED,
  DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR,
} from '../../actions/dashboards/calculate-report-data';

import { DASHBOARDS_UPDATE_FORM_STATE } from '../../actions/dashboards/update-form-state';

import { DensityDashboard } from '../../types';

const initialState = {
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
  formState: {},
  reportList: [],
  timeSegmentLabels: [],
};


export default function dashboards(state=initialState, action) {
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
      data: state.data.map((item: any) => item.id !== action.dashboard.id),
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
