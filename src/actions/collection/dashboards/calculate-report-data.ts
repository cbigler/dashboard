import { REPORTS } from '@density/reports';
import { getActiveEnvironments } from '../../../components/environment-switcher/index';
import fields from '../../../fields';

export const COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE = 'COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE';
export const COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR = 'COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR';

export default function collectionDashboardsCalculateReportData(reports) {
  return async (dispatch, getState) => {
    const baseUrl = (getActiveEnvironments(fields) as any).core;
    const token = getState().sessionToken;

    return Promise.all(reports.map(async report => {
      switch (report.type) {
      case 'HEADER':
        dispatch({
          type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
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
          type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
          report,
          data: {
            hello: 'world',
          },
        });
        break;

      case 'NOOP_ERRORS_IMMEDIATELY':
        dispatch({
          type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
          report,
          error: new Error('Error was thrown during calculation'),
        });
        break;

      default:
        let data, errorThrown: any = false;

        const reportDataCalculationFunction = REPORTS[report.type].calculations;
        if (!reportDataCalculationFunction) {
          dispatch({
            type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
            report,
            error: `No data calculation function found for a report with type ${report.type}!`,
          });
          return;
        }

        try {
          data = await reportDataCalculationFunction(report, { baseUrl, token });
        } catch (err) {
          errorThrown = err;
        }

        if (errorThrown) {
          // Log the error so a developer can see what whent wrong.
          console.error(errorThrown); // DON'T REMOVE ME!
          dispatch({
            type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_ERROR,
            report,
            error: errorThrown.message,
          });
        } else {
          dispatch({
            type: COLLECTION_DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE,
            report,
            data,
          });
        }
      }
    }));
  };
}
