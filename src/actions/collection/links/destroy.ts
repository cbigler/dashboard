import collectionLinksDelete from './delete';
import collectionLinksError from './error';
import core from '../../../client/core';

export const COLLECTION_LINKS_DESTROY = 'COLLECTION_LINKS_DESTROY';

export default function collectionLinksDestroy(link) {
  return async dispatch => {
    dispatch({ type: COLLECTION_LINKS_DESTROY, link });
    try {
      await core().delete(`/links/${link.id}`);
      dispatch(collectionLinksDelete(link));
      return true;
    } catch(err) {
      dispatch(collectionLinksError(err));
      return false;
    }
  };
}
