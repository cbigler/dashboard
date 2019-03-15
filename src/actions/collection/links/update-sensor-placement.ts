import collectionLinksDelete from './delete';
import collectionLinksError from './error';
import collectionLinksCreate from './create';
import { core } from '../../../client';

export const COLLECTION_LINKS_UPDATE_SENSOR_PLACEMENT = 'COLLECTION_LINKS_UPDATE_SENSOR_PLACEMENT';

export default function collectionLinksUpdateSensorPlacement(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_LINKS_UPDATE_SENSOR_PLACEMENT, item });

    try {
      // Remove the old link.
      await core.links.delete({id: item.id});
      dispatch(collectionLinksDelete(item));

      // Then, create a new link.
      return dispatch(collectionLinksCreate(item.spaceId, item.doorwayId, item.sensorPlacement));
    } catch (err) {
      dispatch(collectionLinksError(err));
      return false;
    }
  };
}
