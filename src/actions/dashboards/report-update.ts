import changeCase from 'change-case';

import core from '../../client/core';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DensityReport } from '../../types';

export default function updateReport(report) {
  return async dispatch => {
    let reportResponse;
    try {
      reportResponse = await core().put(`/reports/${report.id}`, {
        name: report.name,
        type: report.type,
        settings: Object.entries(report.settings)
          .reduce((acc, [key, value]) => ({ ...acc, [changeCase.snake(key)]: value }), {})
      });
    } catch (err) {
      return null;
    }
    return objectSnakeToCamel<DensityReport>(reportResponse.data);
  };
}
