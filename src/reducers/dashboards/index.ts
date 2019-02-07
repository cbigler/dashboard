import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DASHBOARDS_SET } from '../../actions/collection/dashboards/set';
import { COLLECTION_DASHBOARDS_ERROR } from '../../actions/collection/dashboards/error';
import { COLLECTION_DASHBOARDS_SELECT } from '../../actions/collection/dashboards/select';
import { ROUTE_TRANSITION_DASHBOARD_DETAIL } from '../../actions/route-transition/dashboard-detail';

import {
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
  COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
} from '../../actions/collection/dashboards/calculate-report-data';

const initialState = {
  loading: true,
  selected: null,
  error: null,
  data: [],
  calculatedReportData: {
    /*
    'rpt_456': {
      'loading': false,
      'data': null,
    }
    */
  },
};

export default function dashboards(state=initialState, action) {
  switch (action.type) {

  // When the active page changes, reset the state of all reports to be at the loading state,
  // removing all of their previously stored data.
  case ROUTE_TRANSITION_DASHBOARD_DETAIL: {
    const allReports = state.data.reduce((acc, dashboard: any) => [...acc, ...dashboard.reportSet], [] as any);
    return {
      ...state,
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

  // Update the whole dashboard collection.
  case COLLECTION_DASHBOARDS_SET: {
    const allReports = action.data.reduce((acc, dashboard) => [...acc, ...dashboard.reportSet], []);
    return {
      ...state,
      loading: false,
      error: null,
      data: action.data.map(objectSnakeToCamel),
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

  // An error occurred.
  case COLLECTION_DASHBOARDS_ERROR:
    return {...state, loading: false, error: action.error};

  default:
    return state;
  }
}
