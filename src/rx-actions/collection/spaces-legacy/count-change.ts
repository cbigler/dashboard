export const COLLECTION_SPACES_COUNT_CHANGE = 'COLLECTION_SPACES_COUNT_CHANGE';

export default function collectionSpacesCountChange({
  id,
  timestamp,
  countChange,
}: {
  id: string,
  timestamp: string,
  countChange: 1 | -1,
}) {
  return { type: COLLECTION_SPACES_COUNT_CHANGE, id, timestamp, countChange } as const;
}
