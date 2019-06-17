import showModal from '../modal/show';
import hideModal from '../modal/hide';
import calculateReportData, { clearReportData } from '../../actions/collection/dashboards/calculate-report-data';

export const PAGE_PICK_EXISTING_REPORT = 'PAGE_PICK_EXISTING_REPORT',
             PAGE_NEW_REPORT_TYPE = 'PAGE_NEW_REPORT_TYPE',
             PAGE_NEW_REPORT_CONFIGURATION = 'PAGE_NEW_REPORT_CONFIGURATION';

export type ReportModalPages = 'PAGE_PICK_EXISTING_REPORT' | 'PAGE_NEW_REPORT_TYPE' | 'PAGE_NEW_REPORT_CONFIGURATION';

export const OPERATION_CREATE = 'OPERATION_CREATE',
             OPERATION_UPDATE = 'OPERATION_UPDATE';

// This is the report id that this report taht is being previewd in the modal has. It's given this
// id so that it is distinguished from all other real reports.
const PREVIEW_REPORT_ID = 'rpt_reportpreview';

export type ReportOperationType = 'OPERATION_CREATE' | 'OPERATION_UPDATE';

export function openReportModal(
  report: object,
  page: ReportModalPages,
  operationType: ReportOperationType,
) {
  return async dispatch => {
    // Start report calculation
    dispatch(rerenderReportInReportModal(report));

    // Open the modal
    dispatch(showModal('REPORT_MODAL', {
      report,
      page,
      operationType,
      pickExistingReportSelectedReportId: null,
      newReportReportTypeSearchString: '',
    }));
  };
}

export function closeReportModal() {
  return async dispatch => {
    await dispatch(hideModal());

    // Clear report calculation
    dispatch(clearReportData(PREVIEW_REPORT_ID));
  }
}

export function rerenderReportInReportModal(report) {
  return dispatch => {
    dispatch(clearReportData(PREVIEW_REPORT_ID));

    // Start report calculation
    const currentDate = null; // FIXME: this is wrong!!!!
    const dashboardWeekStart = 'Sunday';
    dispatch(
      calculateReportData(
        [{...report, id: PREVIEW_REPORT_ID}],
        currentDate,
        dashboardWeekStart,
      ),
    );
  };
}

export function extractCalculatedReportDataFromDashboardsReducer(dashboards) {
  return dashboards.calculatedReportData[PREVIEW_REPORT_ID];
}
