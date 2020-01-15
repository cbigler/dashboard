import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export const COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE = 'COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE';

export default function collectionSpacesSetDefaultTimeRange(space: CoreSpace | undefined) {
  return { type: COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE, space };
}
