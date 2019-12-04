import uuid from 'uuid';
import { AnalyticsActionType } from '..';
import {
  AnalyticsReport,
  AnalyticsFocusedMetric,
  RESOURCE_IDLE,
  AnalyticsReportUnsaved,
  SortDirection,
} from '../../../types/analytics';
import { DispatchType } from '../../../types/rx-actions';

export type PartialAnalyticsReportWithQuery = Partial<AnalyticsReport> & {
  query: AnalyticsReport["query"],
};

export default async function openPartialReport(dispatch: DispatchType, partialReport: PartialAnalyticsReportWithQuery) {
  const report: AnalyticsReportUnsaved = {
    ...partialReport,
    id: uuid.v4(),
    name: 'Untitled Report',
    queryResult: RESOURCE_IDLE,

    hiddenSpaceIds: [],
    columnSort: {
      column: null,
      direction: SortDirection.NONE,
    },

    selectedMetric: AnalyticsFocusedMetric.MAX,
    lastRunTimestamp: undefined,
    isSaved: false,
    isCurrentlySaving: false,


    isOpen: true,
  };

  dispatch({
    type: AnalyticsActionType.ANALYTICS_OPEN_REPORT,
    report,
  });
}
