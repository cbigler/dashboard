import getInObject from 'lodash/get';

import { AnalyticsMetrics, AnalyticsDatapoint, QueryInterval } from "../../types/analytics";
import { DensitySpace } from "../../types";


export function processAnalyticsTableData(tableData: AnalyticsMetrics, datapoints: AnalyticsDatapoint[], interval: QueryInterval, spaceLookup: ReadonlyMap<string, DensitySpace>): AnalyticsMetrics {
  
  return Object.keys(tableData).reduce<AnalyticsMetrics>((analyticsMetrics, spaceId) => {
    const space = spaceLookup.get(spaceId);
    if (!space) {
      throw new Error('Space not found with ID ' + spaceId);
    }

    let peakOpportunity: number | null;
    let averageOpportunity: number | null;

    if (space.targetCapacity) {
      const dataForThisSpace = tableData[spaceId];
      const peakOccupancy = getInObject(dataForThisSpace, 'count.max.value');
      const averagePeakOccupancy = getInObject(dataForThisSpace, 'count.average');
      peakOpportunity = space.targetCapacity - peakOccupancy;
      averageOpportunity = space.targetCapacity - averagePeakOccupancy;
    } else {
      peakOpportunity = null;
      averageOpportunity = null;
    }

    analyticsMetrics[spaceId] = {
      ...tableData[spaceId],
      peakOpportunity,
      averageOpportunity,
    };
    return analyticsMetrics;
  }, {})
}
