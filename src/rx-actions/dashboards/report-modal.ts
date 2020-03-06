import moment from 'moment';
import getInObject from 'lodash/get';

import showModal from '../modal/show';
import hideModal from '../modal/hide';

import calculateReportData, { clearReportData } from './calculate-report-data';

export const PAGE_PICK_SAVED_REPORT = 'PAGE_PICK_SAVED_REPORT',
             PAGE_NEW_REPORT_TYPE = 'PAGE_NEW_REPORT_TYPE',
             PAGE_NEW_REPORT_CONFIGURATION = 'PAGE_NEW_REPORT_CONFIGURATION';

export type ReportModalPages = 'PAGE_PICK_SAVED_REPORT' | 'PAGE_NEW_REPORT_TYPE' | 'PAGE_NEW_REPORT_CONFIGURATION';

export const OPERATION_CREATE = 'OPERATION_CREATE',
             OPERATION_UPDATE = 'OPERATION_UPDATE';

// This is the report id that this report taht is being previewd in the modal has. It's given this
// id so that it is distinguished from all other real reports.
const PREVIEW_REPORT_ID = 'rpt_reportpreview';

export type ReportOperationType = 'OPERATION_CREATE' | 'OPERATION_UPDATE';

export async function openReportModal(
  dispatch: Any<FixInReview>,
  report: object,
  page: ReportModalPages,
  operationType: ReportOperationType,
  dashboardDate,
  dashboardWeekStart,
) {
  dispatch(clearReportData(PREVIEW_REPORT_ID));

  // Run initial report calculation if the modal is being opened onto the page
  // where that is needed
  if (page === PAGE_NEW_REPORT_CONFIGURATION) {
    rerenderReportInReportModal(dispatch, report, dashboardDate, dashboardWeekStart);
  }

  // Open the modal
  showModal(dispatch, 'REPORT_MODAL', {
    report,
    page,
    operationType,
    pickExistingReportSelectedReportId: null,
    newReportReportTypeSearchString: '',
    reportListSearchString: '',
  });
}

export async function closeReportModal(dispatch) {
  await hideModal(dispatch);
  // Clear report calculation
  dispatch(clearReportData(PREVIEW_REPORT_ID));
}

// Called when the user changes the values of the report controls and the report should rerender to
// reflect the new control values.
export async function rerenderReportInReportModal(
  dispatch,
  report,
  dashboardDate,
  dashboardWeekStart = 'Sunday'
) {
  clearPreviewReportData(dispatch);

  // TODO: until we have designs for "partial days", dashboards default to yesterday
  const currentDate = dashboardDate ?
    moment(dashboardDate).format('YYYY-MM-DD') :
    moment().subtract(1, 'day').format('YYYY-MM-DD');

  calculateReportData(
    dispatch,
    [{
      ...report,
      id: PREVIEW_REPORT_ID,
      name: report.name || 'My Report', // Ensure that the report never renders without a name
    }],
    currentDate,
    dashboardWeekStart,
  );
}

export async function clearPreviewReportData(dispatch) {
  return await dispatch(clearReportData(PREVIEW_REPORT_ID));
}

export function extractCalculatedReportDataFromDashboardsReducer(dashboards) {
  // NOTE: falling back to empty object default since the calculatedReportData
  //       for the preview will magically disappear after a modal dismisses
  //       and crash the app.
  return getInObject(dashboards, ['calculatedReportData', PREVIEW_REPORT_ID], {})
}
