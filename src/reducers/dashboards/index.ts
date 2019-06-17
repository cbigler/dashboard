import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DASHBOARDS_SET } from '../../actions/collection/dashboards/set';
import { COLLECTION_DASHBOARDS_PUSH } from '../../actions/collection/dashboards/push';
import { COLLECTION_DASHBOARDS_ERROR } from '../../actions/collection/dashboards/error';
import { COLLECTION_DASHBOARDS_SELECT } from '../../actions/collection/dashboards/select';
import { COLLECTION_DASHBOARDS_UPDATE } from '../../actions/collection/dashboards/update';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../actions/route-transition/dashboard-detail';
import { ROUTE_TRANSITION_DASHBOARD_EDIT } from '../../actions/route-transition/dashboard-edit';

import {
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED,
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR,
} from '../../actions/collection/dashboards/calculate-report-data';


import { DASHBOARDS_SET_FORM_STATE } from '../../actions/dashboards/set-form-state';
import { DASHBOARDS_UPDATE_FORM_STATE } from '../../actions/dashboards/update-form-state';

import { DensityDashboard } from '../../types';

const initialState = {
  loading: true,
  selected: null,
  error: null,
  view: 'LOADING',
  data: [],
  calculatedReportData: {
    /*
    'rpt_456': {
      'state': 'LOADING',
      'data': null,
    }
    */
  },
  formState: {},
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
    return { ...state, selected: action.dashboardId };

  case COLLECTION_DASHBOARDS_UPDATE:
    return { ...state, loading: true, view: 'LOADING' };

  // Update the whole dashboard collection.
  case COLLECTION_DASHBOARDS_SET: {
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

  case COLLECTION_DASHBOARDS_PUSH: {
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

  // Select a new dashboard
  case COLLECTION_DASHBOARDS_SELECT:
    return {
      ...state,
      selected: action.dashboard.id,
    };

  // If report data calculation is successful, add the calculated data into the context for each
  // report.
  case COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE:
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
  case COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR:
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
  case COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED:
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
  case COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR:
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
  case COLLECTION_DASHBOARDS_ERROR:
    return {...state, loading: false, error: action.error};

  // Utilized by the dashboard edit page as a place to store the state of the form
  case DASHBOARDS_SET_FORM_STATE:
    return { ...state, formState: action.formState };
  case DASHBOARDS_UPDATE_FORM_STATE:
    return {
      ...state,
      formState: {
        ...state.formState,
        [action.key]: action.value,
      },
    };

  default:
    return state;
  }
}
