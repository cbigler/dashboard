import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";
import { SpacesLegacySpaceEvent } from "../../../rx-stores/spaces-legacy";

export const COLLECTION_SPACES_SET_EVENTS = 'COLLECTION_SPACES_SET_EVENTS';
export const COLLECTION_SPACES_BATCH_SET_EVENTS = 'COLLECTION_SPACES_BATCH_SET_EVENTS';

export default function collectionSpacesSetEvents(item: CoreSpace, events: Array<SpacesLegacySpaceEvent>) {
  return { type: COLLECTION_SPACES_SET_EVENTS, item, events } as const;
}

type SpaceEventsBySpaceId = {
  [spaceId: string]: Array<SpacesLegacySpaceEvent>
}
export function collectionSpacesBatchSetEvents(events: SpaceEventsBySpaceId) {
  return { type: COLLECTION_SPACES_BATCH_SET_EVENTS, events } as const;
}
