import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import fetchAllObjects from '../../../helpers/fetch-all-objects';

import collectionSpacesError from './error';
import collectionSpacesSet from './set';
import { DispatchType } from '../../../types/rx-actions';

export const COLLECTION_SPACES_FETCH_ALL_START = 'COLLECTION_SPACES_FETCH_ALL_START';

export default async function collectionSpacesFetchAll(dispatch: DispatchType) {
  dispatch({ type: COLLECTION_SPACES_FETCH_ALL_START });
  let spaces: Array<CoreSpace>;
  try {
    spaces = await fetchAllObjects<CoreSpace>('/spaces');
  } catch (err) {
    dispatch(collectionSpacesError(err));
    return null;
  }

  dispatch(collectionSpacesSet(spaces));
  return spaces;
}
