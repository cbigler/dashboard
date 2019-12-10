import { AnalyticsActionType } from '..'
import { AnalyticsReport } from '../../../types/analytics';
import core from '../../../client/core';

import { showToast } from '../../toasts';

type SavedAnalyticsReport = AnalyticsReport;//& { isSaved: true };

export default async function deleteReport(dispatch, analyticsReport: SavedAnalyticsReport) {
  try {
    await core().delete(`/reports/${analyticsReport.id}`);
  } catch (error) {
    showToast(dispatch, { type: 'error', text: 'Error deleting report.' });
    return
  }

  showToast(dispatch, { text: 'Deleted report.' });
  dispatch({
    type: AnalyticsActionType.ANALYTICS_DELETE_REPORT,
    reportId: analyticsReport.id,
  });
}
