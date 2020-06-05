import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import collectionSpacesSet from '../rx-actions/collection/spaces-legacy/set';
import collectionSpacesDelete, { COLLECTION_SPACES_DELETE } from '../rx-actions/collection/spaces-legacy/delete';
import collectionSpacesError from '../rx-actions/collection/spaces-legacy/error';
import collectionSpacesPush from '../rx-actions/collection/spaces-legacy/push';
import collectionSpacesCountChange from '../rx-actions/collection/spaces-legacy/count-change';
import collectionSpacesFilter from '../rx-actions/collection/spaces-legacy/filter';
import collectionSpacesSetEvents, { collectionSpacesBatchSetEvents } from '../rx-actions/collection/spaces-legacy/set-events';
import collectionSpacesSetDefaultTimeRange from '../rx-actions/collection/spaces-legacy/set-default-time-range';
import { COLLECTION_SPACES_CREATE } from '../rx-actions/collection/spaces-legacy/create';
import { COLLECTION_SPACES_DESTROY } from '../rx-actions/collection/spaces-legacy/destroy';
import { COLLECTION_SPACES_UPDATE } from '../rx-actions/collection/spaces-legacy/update';
import { COLLECTION_SPACES_RESET_COUNT } from '../rx-actions/collection/spaces-legacy/reset-count';
import { COLLECTION_SPACE_HIERARCHY_SET } from '../rx-actions/collection/space-hierarchy/set';
import { TRANSITION_TO_SHOW_MODAL, SHOW_MODAL } from '../rx-actions/modal/show';
import { TRANSITION_TO_HIDE_MODAL, HIDE_MODAL } from '../rx-actions/modal/hide';
import { UPDATE_MODAL } from '../rx-actions/modal/update';
import { AdminLocationsSpaceFormResult } from '../rx-stores/space-management';

export type CollectionSpacesCountChange = ReturnType<typeof collectionSpacesCountChange>;
export type CollectionSpacesDelete = ReturnType<typeof collectionSpacesDelete>;
export type CollectionSpacesError = ReturnType<typeof collectionSpacesError>;
export type CollectionSpacesFilter = ReturnType<typeof collectionSpacesFilter>;
export type CollectionSpacesPush = ReturnType<typeof collectionSpacesPush>;
export type CollectionSpacesSet = ReturnType<typeof collectionSpacesSet>;
export type CollectionSpacesSetDefaultTimeRange = ReturnType<typeof collectionSpacesSetDefaultTimeRange>;
export type CollectionSpacesSetEvents = ReturnType<typeof collectionSpacesSetEvents>;
export type CollectionSpacesBatchSetEvents = ReturnType<typeof collectionSpacesBatchSetEvents>;

export type CollectionSpacesCreate = { type: typeof COLLECTION_SPACES_CREATE, item: AdminLocationsSpaceFormResult };
export type CollectionSpacesDestroy = { type: typeof COLLECTION_SPACES_DESTROY, space: CoreSpace };
export type CollectionSpacesUpdate = { type: typeof COLLECTION_SPACES_UPDATE, item: AdminLocationsSpaceFormResult };
export type CollectionSpacesResetCount = { type: typeof COLLECTION_SPACES_RESET_COUNT, item: CoreSpace, newCount: number };

export type CollectionSpaceHierarchySet = { type: typeof COLLECTION_SPACE_HIERARCHY_SET, data: Array<CoreSpace> };

export type TransitionToShowModal = { type: typeof TRANSITION_TO_SHOW_MODAL, name: string, data: object };
export type ShowModal = { type: typeof SHOW_MODAL };

export type TransitionToHideModal = { type: typeof TRANSITION_TO_HIDE_MODAL, name: string, data: object };
export type HideModal = { type: typeof HIDE_MODAL };

export type UpdateModal = { type: typeof UPDATE_MODAL };

export type ReduxAction = (
  CollectionSpacesCountChange |
  CollectionSpacesDelete |
  CollectionSpacesError |
  CollectionSpacesFilter |
  CollectionSpacesPush |
  CollectionSpacesResetCount |
  CollectionSpacesSet |
  CollectionSpacesSetDefaultTimeRange |
  CollectionSpacesSetEvents |
  CollectionSpacesBatchSetEvents |
  CollectionSpacesCreate |
  CollectionSpacesDestroy |
  CollectionSpacesUpdate |
  CollectionSpaceHierarchySet |
  TransitionToShowModal |
  ShowModal |
  TransitionToHideModal |
  HideModal |
  UpdateModal
);
