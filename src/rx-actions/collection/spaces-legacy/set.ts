import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export const COLLECTION_SPACES_SET = 'COLLECTION_SPACES_SET';

export default function collectionSpacesSet(spaces: Array<CoreSpace>) {
  return { type: COLLECTION_SPACES_SET, data: spaces } as const;
}
