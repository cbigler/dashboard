export const COLLECTION_SPACE_HIERARCHY_SET = 'COLLECTION_SPACE_HIERARCHY_SET';

export default function collectionSpaceHierarchySet(hierarchy) {
  return { type: COLLECTION_SPACE_HIERARCHY_SET, data: hierarchy };
}
