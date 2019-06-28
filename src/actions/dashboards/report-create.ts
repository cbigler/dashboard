import changeCase from 'change-case';

import core from '../../client/core';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityReport } from '../../types';
import mixpanelTrack from '../../helpers/mixpanel-track';

export const DASHBOARDS_REPORT_CREATE = 'DASHBOARDS_REPORT_CREATE';

export default function reportCreate(report) {
  return async dispatch => {
    dispatch({type: DASHBOARDS_REPORT_CREATE, report});
    let reportResponse;
    try {
      reportResponse = await core().post('/reports', {
        name: report.name,
        type: report.type,
        settings: Object.entries(report.settings)
          .reduce((acc, [key, value]) => ({ ...acc, [changeCase.snake(key)]: value }), {})
      });
    } catch (err) {
      return null;
    }

    const response = objectSnakeToCamel<DensityReport>(reportResponse.data);

    mixpanelTrack('Report Created', {
      report_id: response.id,
      report_name: response.name,
      report_type: response.type,
    });
    return response;
  };
}
