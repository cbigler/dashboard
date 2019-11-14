import uuid from 'uuid';
import {
  AnalyticsReport,
  AnalyticsFocusedMetric,
  RESOURCE_IDLE,

  AnalyticsActionType,
} from '../../types/analytics';
import { DispatchType } from '../../types/rx-actions';

export type PartialAnalyticsReportWithQuery = Partial<AnalyticsReport> & {
  query: AnalyticsReport["query"],
};

export default async function openPartialReport(dispatch: DispatchType, partialReport: PartialAnalyticsReportWithQuery) {
  // FIXME: This endpoint should take the partial report and make a request to the server with it to
  // make a new report. Point this out in a review!!!
  const report: AnalyticsReport = {
    id: uuid.v4(),
    name: 'Untitled Report',
    type: 'LINE_CHART', // FIXME: figure out the type of analytics reports, point this out in review!
    settings: {},
    queryResult: RESOURCE_IDLE,

    hiddenSpaceIds: [],
    selectedMetric: AnalyticsFocusedMetric.MAX,
    lastRunTimestamp: undefined,
    isSaved: false,
    isCurrentlySaving: false,

    ...partialReport,

    isOpen: true,
  };

  dispatch({
    type: AnalyticsActionType.ANALYTICS_OPEN_REPORT,
    report,
  });
}
