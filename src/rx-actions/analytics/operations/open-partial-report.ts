import uuid from 'uuid';
import { AnalyticsActionType } from '..';
import { RESOURCE_IDLE } from '../../../types/resource';
import {
  AnalyticsReport,
  AnalyticsFocusedMetric,
  AnalyticsReportUnsaved,
} from '../../../types/analytics';
import { DispatchType } from '../../../types/rx-actions';
import { getDefaultColumnSortForMetric } from '../../../helpers/analytics-table';

export type PartialAnalyticsReportWithQuery = Partial<AnalyticsReport> & {
  query: AnalyticsReport["query"],
};

export default async function openPartialReport(dispatch: DispatchType, partialReport: PartialAnalyticsReportWithQuery) {

  const selectedMetric = AnalyticsFocusedMetric.MAX;

  const report: AnalyticsReportUnsaved = {
    ...partialReport,
    id: uuid.v4(),
    name: 'Untitled Report',
    queryResult: RESOURCE_IDLE,

    hiddenSpaceIds: [],
    highlightedSpaceId: null,
    columnSort: getDefaultColumnSortForMetric(selectedMetric),

    selectedMetric,
    opportunityCostPerPerson: partialReport.opportunityCostPerPerson || 300,
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
