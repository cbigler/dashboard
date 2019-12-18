import uuid from 'uuid';
import { AnalyticsActionType } from '..';
import {
  AnalyticsReport,
  QueryInterval,
  AnalyticsFocusedMetric,
  RESOURCE_IDLE,
} from '../../../types/analytics'
import { DATE_RANGES } from '../../../helpers/space-time-utilities';
import { getDefaultColumnSortForMetric } from '../../../helpers/analytics-table';

export default async function createReport(dispatch) {

  const selectedMetric = AnalyticsFocusedMetric.MAX;

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
    highlightedSpaceId: null,
    columnSort: getDefaultColumnSortForMetric(selectedMetric),
    
    selectedMetric,
    opportunityCostPerPerson: 300,
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
