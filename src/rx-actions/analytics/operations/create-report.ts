import uuid from 'uuid';
import { AnalyticsActionType } from '..';
import {
  AnalyticsReport,
  QueryInterval,
  AnalyticsFocusedMetric,
  RESOURCE_IDLE,
} from '../../../types/analytics'
import { DATE_RANGES } from '../../../helpers/space-time-utilities';

export default async function createReport(dispatch) {
  const newReport: AnalyticsReport = {
    id: uuid.v4(),
    name: 'Untitled Report',
    creatorEmail: '',
    query: {
      dateRange: DATE_RANGES.LAST_WEEK,
      interval: QueryInterval.ONE_HOUR,
      selections: [],
    },
    queryResult: RESOURCE_IDLE,

    hiddenSpaceIds: [],
    selectedMetric: AnalyticsFocusedMetric.MAX,
    lastRunTimestamp: undefined,
    isSaved: false,
    isCurrentlySaving: false,
    isOpen: true,
  };

  dispatch({
    type: AnalyticsActionType.ANALYTICS_OPEN_REPORT,
    report: newReport,
  });
}