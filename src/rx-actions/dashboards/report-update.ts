import core from '../../client/core';
import { DensityReport } from '../../types';

export default async function updateReport(dispatch, report) {
  let reportResponse;
  try {
    reportResponse = await core().put(`/reports/${report.id}`, {
      name: report.name,
      type: report.type,
      settings: report.settings,
    });
  } catch (err) {
    return null;
  }
  return reportResponse.data as DensityReport;
}
