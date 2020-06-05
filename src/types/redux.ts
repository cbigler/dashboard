import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { COLLECTION_SPACES_SET } from '../rx-actions/collection/spaces-legacy/set';
import { COLLECTION_SPACES_DELETE } from '../rx-actions/collection/spaces-legacy/delete';
import { COLLECTION_SPACES_ERROR } from '../rx-actions/collection/spaces-legacy/error';
import { COLLECTION_SPACES_PUSH } from '../rx-actions/collection/spaces-legacy/push';
import { COLLECTION_SPACES_UPDATE } from '../rx-actions/collection/spaces-legacy/update';
import { COLLECTION_SPACE_HIERARCHY_SET } from '../rx-actions/collection/space-hierarchy/set';
import { TRANSITION_TO_SHOW_MODAL, SHOW_MODAL } from '../rx-actions/modal/show';
import { TRANSITION_TO_HIDE_MODAL, HIDE_MODAL } from '../rx-actions/modal/hide';
import { UPDATE_MODAL } from '../rx-actions/modal/update';
import { AdminLocationsSpaceFieldUpdate } from '../rx-stores/space-management';

export type CollectionSpacesSet = { type: typeof COLLECTION_SPACES_SET, data: Array<CoreSpace> };
export type CollectionSpacesDelete = { type: typeof COLLECTION_SPACES_DELETE, item: CoreSpace };
export type CollectionSpacesError = { type: typeof COLLECTION_SPACES_ERROR, error: Error | string };
export type CollectionSpacesPush = { type: typeof COLLECTION_SPACES_PUSH, item: CoreSpace };
export type CollectionSpacesUpdate = { type: typeof COLLECTION_SPACES_UPDATE, item: AdminLocationsSpaceFieldUpdate };
export type CollectionSpaceHierarchySet = { type: typeof COLLECTION_SPACE_HIERARCHY_SET, data: Array<CoreSpace> };

export type TransitionToShowModal = { type: typeof TRANSITION_TO_SHOW_MODAL, name: string, data: object };
export type ShowModal = { type: typeof SHOW_MODAL };

export type TransitionToHideModal = { type: typeof TRANSITION_TO_HIDE_MODAL, name: string, data: object };
export type HideModal = { type: typeof HIDE_MODAL };

export type UpdateModal = { type: typeof UPDATE_MODAL };

export type ReduxAction = (
  CollectionSpacesSet |
  CollectionSpacesDelete |
  CollectionSpacesError |
  CollectionSpacesPush |
  CollectionSpacesUpdate |
  CollectionSpaceHierarchySet |
  TransitionToShowModal |
  ShowModal |
  TransitionToHideModal |
  HideModal |
  UpdateModal
);
