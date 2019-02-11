export const COLLECTION_SPACES_SET_EVENTS = 'COLLECTION_SPACES_SET_EVENTS';
export const COLLECTION_SPACES_BATCH_SET_EVENTS = 'COLLECTION_SPACES_BATCH_SET_EVENTS';

export default function collectionSpacesSetEvents(item, events) {
  return { type: COLLECTION_SPACES_SET_EVENTS, item, events };
}

export function collectionSpacesBatchSetEvents(events) {
  return { type: COLLECTION_SPACES_BATCH_SET_EVENTS, events };
}
