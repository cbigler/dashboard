export const COLLECTION_SPACES_COUNT_CHANGE = 'COLLECTION_SPACES_COUNT_CHANGE';

export default function collectionSpacesCountChange({id, timestamp, countChange}) {
  return { type: COLLECTION_SPACES_COUNT_CHANGE, id, timestamp, countChange };
}
