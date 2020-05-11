import getInObject from 'lodash/get';
import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";
import { DATE_RANGES } from '@density/lib-time-helpers/date-range';

import { RESOURCE_IDLE } from "../../types/resource";
import {
  AnalyticsFocusedMetric,
  AnalyticsReport,
  QueryInterval,
  QuerySelectionType,
  SpaceCountQuery,
  SortDirection,
  StoredAnalyticsReport,
} from "../../types/analytics";


export function isQueryRunnable(query: SpaceCountQuery): boolean {
  return (
    query.selections.length > 0
  );
}

export function convertStoredAnalyticsReportToAnalyticsReport(
  report: StoredAnalyticsReport,
  opts: { isSaved?: boolean, isOpen?: boolean } = {},
): AnalyticsReport {
  return {
    id: report.id,
    name: report.name,
    creator_email: report.creator_email || '',

    hiddenSpaceIds: [],
    highlightedSpaceId: null,
    columnSort: {
      column: null,
      direction: SortDirection.NONE,
    },

    selectedMetric: report.settings.selectedMetric || AnalyticsFocusedMetric.MAX,

    opportunityCostPerPerson: report.settings.opportunityCostPerPerson || 300,

    isSaved: typeof opts.isSaved !== 'undefined' ? opts.isSaved : true,
    isCurrentlySaving: false,
    isOpen: typeof opts.isOpen !== 'undefined' ? opts.isOpen : false,

    query: report.settings.query || {
      dateRange: DATE_RANGES.LAST_WEEK,
      interval: QueryInterval.ONE_HOUR,
      selections: [],
      filters: [],
    },
    queryResult: { ...RESOURCE_IDLE },
  }
}

export function realizeSpacesFromQuery(spaces: Array<CoreSpace>, query: SpaceCountQuery): Array<CoreSpace> {
  return spaces.filter(space => {
    const spaceMatchesQuery = query.selections.some(selection => {
      switch (selection.type) {
      case QuerySelectionType.SPACE: {
        const targetValue = getInObject(space, selection.field);

        // Special case: null space function means "other" :face_palm:
        if (selection.field === 'function' && 
            targetValue === null &&
            (selection.values as Any<FixInRefactor>).includes(null)) return true;
        
        // Other than the special-case null matching "other", falsy value means no match
        if (!targetValue) return false;
        
        // FIXME: I have no idea what's wrong with the below...
        return (selection.values as Any<FixInRefactor>).includes(targetValue);
      }
      default:
        return false;
      }
    });
    return Boolean(spaceMatchesQuery);
  });
}
