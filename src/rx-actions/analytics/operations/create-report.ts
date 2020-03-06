import uuid from 'uuid';
import { AnalyticsActionType } from '..';
import { RESOURCE_IDLE } from '../../../types/resource';
import {
  AnalyticsReport,
  QueryInterval,
  AnalyticsFocusedMetric,
  QuerySelectionType,
} from '../../../types/analytics'
import { DATE_RANGES } from '@density/lib-time-helpers/date-range';
import { getDefaultColumnSortForMetric } from '../../../helpers/analytics-table';
import { DispatchType } from '../../../types/rx-actions';

export default async function createReport(dispatch: DispatchType, spaceIds=null as Array<string> | null) {

  const selectedMetric = AnalyticsFocusedMetric.MAX;

  const newReport: AnalyticsReport = {
    id: uuid.v4(),
    name: 'Untitled Report',
    creator_email: '',
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

  // Immediately query some spaces, if provided
  if (spaceIds) {
    dispatch({
      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
      reportId: newReport.id,
      selections: [{
        type: QuerySelectionType.SPACE,
        field: "id",
        values: spaceIds,
      }]
    })
  }
}
