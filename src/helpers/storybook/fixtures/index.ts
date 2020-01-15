import hierarchy from './hierarchy.json';
import spaces from './spaces.json';
import batchCounts from './batch-counts.json';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import {
  DensitySpaceCountBucket,
} from '../../../types';
import {
  AnalyticsMetrics,
} from '../../../types/analytics';


export const HIERARCHY = hierarchy;
export const SPACES: CoreSpace[] = spaces.results as Any<FixInRefactor>;
export const BATCH_COUNTS: {
  results: { [space_id: string]: DensitySpaceCountBucket[] },
  metrics: AnalyticsMetrics,
} = {
  results: Object.keys(batchCounts.results).reduce((output, space_id) => {
    if (!Array.isArray(batchCounts.results[space_id])) return output;
    output[space_id] = batchCounts.results[space_id]
    return output;
  }, {}),
  metrics: Object.keys(batchCounts.metrics).reduce((output, space_id) => {
    if (!Array.isArray(batchCounts.metrics[space_id])) return output;
    output[space_id] = batchCounts.metrics[space_id]
    return output;
  }, {})
}
