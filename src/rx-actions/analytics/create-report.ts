import uuid from 'uuid';
import {
  AnalyticsReport,
  QueryInterval,
  AnalyticsFocusedMetric,
  RESOURCE_IDLE,

  AnalyticsActionType,
} from '../../types/analytics'
import { DATE_RANGES } from '../../helpers/space-time-utilities';

export default async function createReport(dispatch) {
  const newReport: AnalyticsReport = {
    id: uuid.v4(),
    name: 'Untitled Report',
    query: {
      dateRange: DATE_RANGES.LAST_WEEK,
      interval: QueryInterval.ONE_HOUR,
      selections: [],
      filters: [],
    },
    queryResult: RESOURCE_IDLE,

    hiddenSpaceIds: [],
    selectedMetric: AnalyticsFocusedMetric.MAX,
    lastRunTimestamp: undefined,
    isSaved: false,
  };

  dispatch({
    type: AnalyticsActionType.ANALYTICS_OPEN_REPORT,
    report: newReport,
  });
}
