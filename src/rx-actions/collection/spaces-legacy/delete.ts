import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";

export const COLLECTION_SPACES_DELETE = 'COLLECTION_SPACES_DELETE';

export default function collectionSpacesDelete(item: CoreSpace) {
  return { type: COLLECTION_SPACES_DELETE, item } as const;
}
