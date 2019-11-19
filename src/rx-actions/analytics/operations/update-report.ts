import { AnalyticsActionType } from '..';
import { DensityReport } from '../../../types';
import { AnalyticsReport, StoredAnalyticsReport } from '../../../types/analytics';
import core from '../../../client/core';

import { showToast } from '../../toasts';
import objectSnakeToCamel from '../../../helpers/object-snake-to-camel';
import mixpanelTrack from '../../../helpers/tracking/mixpanel-track';


// type sent with PUT/POST requests to update/create the report
type StoredAnalyticsReportUpdate = Omit<StoredAnalyticsReport, 'id' | 'creatorEmail' | 'dashboardCount'>

export default async function updateReport(dispatch, analyticsReport: AnalyticsReport) {
  dispatch({
    type: AnalyticsActionType.ANALYTICS_UPDATE_REPORT,
    reportId: analyticsReport.id,
    report: { ...analyticsReport, isCurrentlySaving: true },
  });

  const method = analyticsReport.isSaved ? 'put' : 'post';

  let response;
  try {
    const update: StoredAnalyticsReportUpdate = {
      name: analyticsReport.name,
      type: 'LINE_CHART',
      settings: {
        query: analyticsReport.query,
        selectedMetric: analyticsReport.selectedMetric,
      }
    }
    response = await core()[method](analyticsReport.isSaved ? `/reports/${analyticsReport.id}` : '/reports', update);
  } catch (error) {
    showToast(dispatch, { type: 'error', text: 'Error updating report.' })
    return
  }

  const reportResponse = objectSnakeToCamel<DensityReport>(response.data);

  mixpanelTrack(analyticsReport.isSaved ? 'Analytics Create Report' : 'Analytics Update Report', {
    'Report ID': reportResponse.id,
    'Report Name': reportResponse.name,
  });

  showToast(dispatch, { text: analyticsReport.isSaved ? 'Updated Report': 'Created Report' });
  dispatch({
    type: AnalyticsActionType.ANALYTICS_UPDATE_REPORT,
    reportId: analyticsReport.id,
    report: {
      ...analyticsReport,
      ...reportResponse,
      isSaved: true,
      isCurrentlySaving: false,
    },
  });
}
