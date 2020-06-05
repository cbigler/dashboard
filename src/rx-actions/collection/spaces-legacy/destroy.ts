import collectionSpacesDelete from './delete';
import collectionSpacesError from './error';
import core from '../../../client/core';
import { DispatchType } from '../../../types/rx-actions';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export const COLLECTION_SPACES_DESTROY = 'COLLECTION_SPACES_DESTROY';

export default async function collectionSpacesDestroy(dispatch: DispatchType, space: CoreSpace) {
  dispatch({ type: COLLECTION_SPACES_DESTROY, space });

  try {
    await core().delete(`/spaces/${space.id}`, { data: { name: space.name } });
  } catch (err) {
    dispatch(collectionSpacesError(err));
    return false;
  }

  dispatch(collectionSpacesDelete(space));
  return true;
}
