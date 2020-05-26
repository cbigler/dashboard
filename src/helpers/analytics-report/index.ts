import getInObject from 'lodash/get';
import { Moment } from 'moment-timezone';
import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";
import { DATE_RANGES } from '@density/lib-time-helpers/date-range';

import core from '../../client/core';
import { RESOURCE_IDLE } from "../../types/resource";
import { TimeFilter } from '../../types/datetime';
import { SpacesCountsAPIResponse, SpacesCountsMetricsAPIResponse } from '../../types/api';
import {
  AnalyticsFocusedMetric,
  AnalyticsMetrics,
  AnalyticsReport,
  QueryInterval,
  QuerySelectionType,
  SpaceCountQuery,
  SortDirection,
  StoredAnalyticsReport,
} from "../../types/analytics";

import mixpanelTrack from '../../helpers/tracking/mixpanel-track';
import { serializeTimeFilter } from '../../helpers/datetime-utilities';
import { getGoSlow } from '../../components/environment-switcher';


export type ChartDataFetchingResult = {
  [space_id: string]: Array<{
    start: string,
    end: string,
    analytics: {
      max: number,
      min: number,
      entrances: number,
      exits: number,
      events: number,
      utilization: number | null,
      target_utilization: number | null,
    }
  }>
}

export type TableDataFetchingResult = AnalyticsMetrics;


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

// ----------------------------------------------------------------------------
// RUN REPORT QUERY WHEN IT CHANGES
// ----------------------------------------------------------------------------

export async function runQuery(startDate: Moment, endDate: Moment, interval: QueryInterval, selectedSpaceIds: string[], selectedMetric: AnalyticsFocusedMetric, timeFilter?: TimeFilter) {

  let timeFilterString: string;
  if (timeFilter) {
    timeFilterString = serializeTimeFilter(timeFilter);
  } else {
    timeFilterString = '';
  }

  mixpanelTrack('Analytics Run Query', {
    'Start Time': startDate.format(),
    'End Time': endDate.format(),
    'Metric': selectedMetric,
    'Interval': interval,
    'Time Filter': timeFilterString,
    'Space ID List': selectedSpaceIds.join(','),
  });

  // avoid passing the param altogether if the time filter is empty
  const tableRequestTimeFilterParams = timeFilter ? {
    time_filters: timeFilterString
  } : {};
  
  const sharedParams = {
    // NOTE: using this date format to avoid sending up the TZ offset (eg. -04:00)
    //       so that the backend interprets the date in the space's local time
    start_time: startDate.format('YYYY-MM-DDTHH:mm:ss'),
    end_time: endDate.format('YYYY-MM-DDTHH:mm:ss'),
    space_list: selectedSpaceIds.join(','),
    interval: interval,
    page_size: '10000',
    slow: getGoSlow(),
  }

  async function getChartData() {
    const allResponses: SpacesCountsAPIResponse[] = [];
    const client = core();

    // for the chart data, no time filter is used and always use 15m interval
    let response = await client.get<SpacesCountsAPIResponse>('/spaces/counts', {
      params: Object.assign({}, sharedParams, {
        interval: '15m',
      })
    })
    // superstitiously making a copy of the response data since we're reusing that variable for each page
    allResponses.push(Object.assign({}, response.data));
    
    while (response.data.next) {
      response = await client.get<SpacesCountsAPIResponse>(response.data.next);
      allResponses.push(Object.assign({}, response.data));
    }

    

    return allResponses.reduce<ChartDataFetchingResult>((output, current) => {
      Object.keys(current.results).forEach(space_id => {
        const buckets = current.results[space_id].map(d => d.interval);
        if (!output[space_id]) {
          output[space_id] = buckets;
        } else {
          output[space_id].push(...buckets)
        }
      })
      return output;
    }, {})

  }

  async function getTableMetrics() {
    const response = await core().get<SpacesCountsMetricsAPIResponse>('/spaces/counts/metrics', {
      params: Object.assign({}, sharedParams, tableRequestTimeFilterParams)
    })
    return response.data.metrics;
  }
  
  const chartDataPromise = getChartData();
  const tableDataPromise = getTableMetrics();

  return await Promise.all([chartDataPromise, tableDataPromise]);
}
