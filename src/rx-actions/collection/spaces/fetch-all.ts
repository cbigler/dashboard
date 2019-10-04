import { DensitySpace } from '../../../types';
import fetchAllObjects from '../../../helpers/fetch-all-objects';

import collectionSpacesError from './error';
import collectionSpacesSet from './set';

export const COLLECTION_SPACES_FETCH_ALL_START = 'COLLECTION_SPACES_FETCH_ALL_START';

export default async function collectionSpacesFetchAll(dispatch) {
  dispatch({ type: COLLECTION_SPACES_FETCH_ALL_START });
  let spaces;
  try {
    spaces = await fetchAllObjects<DensitySpace>('/spaces');
  } catch (err) {
    dispatch(collectionSpacesError(err));
    return null;
  }

  dispatch(collectionSpacesSet(spaces));
  return spaces;
}
