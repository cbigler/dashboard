import objectSnakeToCamel from '../../../helpers/object-snake-to-camel/index';
import { DensitySpace } from '../../../types';

export const COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE = 'COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE';

export default function collectionSpacesSetDefaultTimeRange(space) {
  return { type: COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE, space: objectSnakeToCamel<DensitySpace>(space) };
}
