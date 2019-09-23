import { DensitySpace } from '.';
import { ReduxState } from '../rx-stores';
// import { COLLECTION_SPACES_SET } from '../actions/collection/spaces/set';
// import { COLLECTION_SPACES_ERROR } from '../actions/collection/spaces/error';

export type LegacyThunkAction<T extends any = void> = (dispatch: LegacyReduxDispatch<T>, getState: () => ReduxState) => T;
export type LegacyReduxDispatch<T extends any = void> = (action: ReduxAction | LegacyThunkAction<T>) => typeof action extends ReduxAction ? void : T


// FIXME: The below 'COLLECTION_SPACES_SET' and 'COLLECTION_SPACES_ERROR' should use the constants
// imported above, but if I do that, it types it as `string` and not the constant string it is set
// to. Please point this point in a review!
export type CollectionSpacesSet = { type: 'COLLECTION_SPACES_SET', data: Array<DensitySpace> };
export type CollectionSpacesError = { type: 'COLLECTION_SPACES_ERROR', error: Error | string };
export type CollectionSpaceHierarchySet = { type: 'COLLECTION_SPACE_HIERARCHY_SET', data: Array<DensitySpace> };

export type TransitionToShowModal = { type: 'TRANSITION_TO_SHOW_MODAL', name: string, data: object };
export type ShowModal = { type: 'SHOW_MODAL' };

export type TransitionToHideModal = { type: 'TRANSITION_TO_HIDE_MODAL', name: string, data: object };
export type HideModal = { type: 'HIDE_MODAL' };

export type UpdateModal = { type: 'UPDATE_MODAL' };

export type ReduxAction = (
  CollectionSpacesSet |
  CollectionSpacesError |
  CollectionSpaceHierarchySet |
  TransitionToShowModal |
  ShowModal |
  TransitionToHideModal |
  HideModal |
  UpdateModal
);
