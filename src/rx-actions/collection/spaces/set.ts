import { CollectionSpacesSet } from '../../../types/redux';
export const COLLECTION_SPACES_SET = 'COLLECTION_SPACES_SET';

export default function collectionSpacesSet(spaces): CollectionSpacesSet {
  return { type: COLLECTION_SPACES_SET, data: spaces };
}
