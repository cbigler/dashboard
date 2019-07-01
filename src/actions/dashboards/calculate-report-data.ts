import { REPORTS, UnauthorizedError } from '@density/reports';
import { getGoSlow } from '../../components/environment-switcher/index';
import core from '../../client/core';

import { DensityReportCalculatationFunction } from '../../types';
import getBackendErrorDetail from '../../helpers/get-backend-error-detail';

export const DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE = 'DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE';
export const DASHBOARDS_CALCULATE_REPORT_DATA_ERROR = 'DASHBOARDS_CALCULATE_REPORT_DATA_ERROR';
export const DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED = 'DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED';
export const DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR = 'DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR';
export const DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA = 'DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA';

export default function collectionDashboardsCalculateReportData(reports, date, weekStart) {
  return async (dispatch, getState) => {
    return Promise.all(reports.map(async report => {
      switch (report.type) {
      case 'HEADER':
        dispatch({
          type: DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
          report,
          data: null, /* headers don't need data */
        });
        break;

      // The below three "reports" are used in the tests to validate the interaction between the
      // actions and reducers works properly.
      case 'NOOP_DOES_NOTHING':
        break;

      case 'NOOP_COMPLETES_IMMEDIATELY':
        dispatch({
          type: DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
          report,
          data: {
            hello: 'world',
          },
        });
        break;

      case 'NOOP_ERRORS_IMMEDIATELY':
        dispatch({
          type: DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
          report,
          error: new Error('Error was thrown during calculation'),
        });
        break;

      default:
        let data, errorThrown: any = false;

        const reportDataCalculationFunction: DensityReportCalculatationFunction = REPORTS[report.type].calculations;
        if (!reportDataCalculationFunction) {
          dispatch({
            type: DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
            report,
            error: `No data calculation function found for a report with type ${report.type}!`,
          });
          return;
        }

        try {
          data = await reportDataCalculationFunction(
            report,
            { date, weekStart, client: core(), slow: getGoSlow() }
          );
        } catch (err) {
          errorThrown = err;
        }

        if (errorThrown) {
          // Log the error so a developer can see what went wrong.
          console.error(errorThrown); // DON'T REMOVE ME!
          if (errorThrown instanceof UnauthorizedError) {
            dispatch({
              type: DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED,
              report,
            });
          } else if (
            errorThrown.response &&
            errorThrown.response.status === 400 &&
            getBackendErrorDetail(errorThrown) === 'end_time must be after the space was created.'
          ) {
            dispatch({
              type: DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA,
              report,
            });
          } else {
            dispatch({
              type: DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
              report,
              error: errorThrown.message,
            });
          }
        } else {
          dispatch({
            type: DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
            report,
            data,
          });
        }
      }
    }));
  };
}

export function clearReportData(reportId) {
  return { type: DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR, reportId };
}
