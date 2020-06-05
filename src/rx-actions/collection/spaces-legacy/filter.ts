export const COLLECTION_SPACES_FILTER = 'COLLECTION_SPACES_FILTER';

export default function collectionSpacesFilter(filter: 'search' | 'parent', value: string) {
  return { type: COLLECTION_SPACES_FILTER, filter, value } as const;
}
