export const COLLECTION_TAGS_ERROR = 'COLLECTION_TAGS_ERROR';

export default function collectionTagsError(error) {
  return { type: COLLECTION_TAGS_ERROR, error };
}
