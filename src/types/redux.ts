import { DensitySpace } from '.';
// import { COLLECTION_SPACES_SET } from '../actions/collection/spaces/set';
// import { COLLECTION_SPACES_ERROR } from '../actions/collection/spaces/error';

// FIXME: The below 'COLLECTION_SPACES_SET' and 'COLLECTION_SPACES_ERROR' should use the constants
// imported above, but if I do that, it types it as `string` and not the constant string it is set
// to. Please point this point in a review!
export type CollectionSpacesSet = { type: 'COLLECTION_SPACES_SET', data: Array<DensitySpace> };
export type CollectionSpacesError = { type: 'COLLECTION_SPACES_ERROR', error: Error | string };
export type CollectionSpaceHierarchySet = { type: 'COLLECTION_SPACE_HIERARCHY_SET', data: Array<DensitySpace> };

export type ReduxAction = (
  CollectionSpacesSet |
  CollectionSpacesError |
  CollectionSpaceHierarchySet
);
