import getInObject from 'lodash/get';

import { AnalyticsMetrics, AnalyticsDatapoint, QueryInterval } from "../../types/analytics";
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';


export function processAnalyticsTableData(tableData: AnalyticsMetrics, datapoints: AnalyticsDatapoint[], interval: QueryInterval, spaceLookup: ReadonlyMap<string, CoreSpace>): AnalyticsMetrics {
  
  return Object.keys(tableData).reduce<AnalyticsMetrics>((analyticsMetrics, space_id) => {
    const space = spaceLookup.get(space_id);
    if (!space) {
      throw new Error('Space not found with ID ' + space_id);
    }

    let peakOpportunity: number | null;
    let averageOpportunity: number | null;

    if (space.target_capacity) {
      const dataForThisSpace = tableData[space_id];
      const peakOccupancy = getInObject(dataForThisSpace, 'count.max.value');
      const averagePeakOccupancy = getInObject(dataForThisSpace, 'count.average');
      peakOpportunity = space.target_capacity - peakOccupancy;
      averageOpportunity = space.target_capacity - averagePeakOccupancy;
    } else {
      peakOpportunity = null;
      averageOpportunity = null;
    }

    analyticsMetrics[space_id] = {
      ...tableData[space_id],
      peakOpportunity,
      averageOpportunity,
    };
    return analyticsMetrics;
  }, {})
}
