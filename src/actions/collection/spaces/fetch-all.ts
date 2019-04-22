import core from '../../../client/core';
import { DensitySpace } from '../../../types';

import objectSnakeToCamel from '../../../helpers/object-snake-to-camel/index';
import fetchAllPages from '../../../helpers/fetch-all-pages/index';

import collectionSpacesError from './error';
import collectionSpacesSet from './set';

export const COLLECTION_SPACES_FETCH_ALL_START = 'COLLECTION_SPACES_FETCH_ALL_START';

export default function collectionSpacesFetchAll(opts={force: false}) {
  return async (dispatch, getState) => {
    const shouldLoadSpaces = getState().spaces.view !== 'VISIBLE';

    if (opts.force || shouldLoadSpaces) {
      dispatch({ type: COLLECTION_SPACES_FETCH_ALL_START });
      let spaces;
      try {
        const rawSpaces = await fetchAllPages(async page => {
          const response = await core().get(`/spaces`, {
            params: {
              page,
              page_size: 5000,
            },
          });
          return response.data;
        });
        spaces = rawSpaces.map(d => objectSnakeToCamel<DensitySpace>(d));
      } catch (err) {
        dispatch(collectionSpacesError(err));
        return null;
      }

      dispatch(collectionSpacesSet(spaces));
      return spaces;
    }
  };
}
