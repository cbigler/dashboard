export const COLLECTION_SPACES_FILTER = 'COLLECTION_SPACES_FILTER';

export default function collectionSpacesFilter(filter, value) {
  return { type: COLLECTION_SPACES_FILTER, filter, value };
}
