import objectSnakeToCamel from '../../object-snake-to-camel';
import hierarchy from './hierarchy.json';
import spaces from './spaces.json';
import batchCounts from './batch-counts.json';
import {
  DensitySpace,
  DensitySpaceCountBucket,
} from '../../../types';
import {
  AnalyticsMetrics,
} from '../../../types/analytics';


export const HIERARCHY = objectSnakeToCamel(hierarchy);
export const SPACES: DensitySpace[] = spaces.results.map(objectSnakeToCamel);
export const BATCH_COUNTS: {
  results: { [spaceId: string]: DensitySpaceCountBucket[] },
  metrics: AnalyticsMetrics,
} = {
  results: Object.keys(batchCounts.results).reduce((output, spaceId) => {
    if (!Array.isArray(batchCounts.results[spaceId])) return output;
    output[spaceId] = batchCounts.results[spaceId].map(objectSnakeToCamel)
    return output;
  }, {}),
  metrics: Object.keys(batchCounts.metrics).reduce((output, spaceId) => {
    if (!Array.isArray(batchCounts.metrics[spaceId])) return output;
    output[spaceId] = batchCounts.metrics[spaceId].map(objectSnakeToCamel)
    return output;
  }, {})
}
