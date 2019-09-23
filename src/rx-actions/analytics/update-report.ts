import { DensityReport } from '../../types';
import {
  AnalyticsReport,
  AnalyticsActionType,
} from '../../types/analytics';
import core from '../../client/core';

import { rxDispatch } from '../../rx-stores';
import { showToast } from '../../rx-actions/toasts';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import mixpanelTrack from '../../helpers/mixpanel-track';

export default async function updateReport(analyticsReport: AnalyticsReport) {
  rxDispatch({
    type: AnalyticsActionType.ANALYTICS_UPDATE_REPORT,
    reportId: analyticsReport.id,
    report: { ...analyticsReport, isCurrentlySaving: true },
  });

  const method = analyticsReport.isSaved ? 'put' : 'post';

  let response;
  try {
    response = await core()[method](analyticsReport.isSaved ? `/reports/${analyticsReport.id}` : '/reports', {
      name: analyticsReport.name,
      type: analyticsReport.type,
      // FIXME: we need to figure out where the query is going to be stored. Point this out in a
      // review!
      settings: {
        ...analyticsReport.settings,
        query: analyticsReport.query,
      },
    });
  } catch (error) {
    showToast(rxDispatch, { type: 'error', text: 'Error updating toast.' })
    return
  }

  const reportResponse = objectSnakeToCamel<DensityReport>(response.data);

  mixpanelTrack(analyticsReport.isSaved ? 'Analytics Create Report' : 'Analytics Update Report', {
    'Report ID': reportResponse.id,
    'Report Name': reportResponse.name,
  });

  showToast(rxDispatch, { text: analyticsReport.isSaved ? 'Updated Report': 'Created Report' });
  rxDispatch({
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
