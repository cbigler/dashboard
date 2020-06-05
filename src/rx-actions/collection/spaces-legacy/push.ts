import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";

export const COLLECTION_SPACES_PUSH = 'COLLECTION_SPACES_PUSH';

export default function collectionSpacesPush(item: Partial<CoreSpace>) {
  return { type: COLLECTION_SPACES_PUSH, item } as const;
}
