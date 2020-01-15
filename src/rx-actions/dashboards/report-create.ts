import core from '../../client/core';
import { DensityReport } from '../../types';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';

export const DASHBOARDS_REPORT_CREATE = 'DASHBOARDS_REPORT_CREATE';

export default async function reportCreate(dispatch, report) {
  dispatch({type: DASHBOARDS_REPORT_CREATE, report});
  let reportResponse;
  try {
    reportResponse = await core().post('/reports', {
      name: report.name,
      type: report.type,
      settings: report.settings
    });
  } catch (err) {
    return null;
  }

  const response = reportResponse.data as DensityReport;

  mixpanelTrack('Report Created', {
    report_id: response.id,
    report_name: response.name,
    report_type: response.type,
  });
  return response;
}
