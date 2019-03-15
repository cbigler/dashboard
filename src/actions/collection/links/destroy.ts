import collectionLinksDelete from './delete';
import { core } from '../../../client';

export const COLLECTION_LINKS_DESTROY = 'COLLECTION_LINKS_DESTROY';

export default function collectionLinksDestroy(link) {
  return dispatch => {
    dispatch({ type: COLLECTION_LINKS_DESTROY, link });

    return core.links.delete({id: link.id}).then(() => {
      dispatch(collectionLinksDelete(link));
    });
  };
}
