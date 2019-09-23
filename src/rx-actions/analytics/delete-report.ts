import {
  AnalyticsReport,
  AnalyticsActionType,
} from '../../types/analytics';
import core from '../../client/core';

import { rxDispatch } from '../../rx-stores';
import { showToast } from '../../rx-actions/toasts';

type SavedAnalyticsReport = AnalyticsReport;//& { isSaved: true };

export default async function deleteReport(analyticsReport: SavedAnalyticsReport) {
  try {
    await core().delete(`/reports/${analyticsReport.id}`);
  } catch (error) {
    showToast(rxDispatch, { type: 'error', text: 'Error deleting report.' })
    return
  }

  showToast(rxDispatch, { text: 'Deleted report.' });
  rxDispatch({
    type: AnalyticsActionType.ANALYTICS_DELETE_REPORT,
    reportId: analyticsReport.id,
  });
}
