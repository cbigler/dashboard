import collectionLinksPush from './push';
import collectionLinksError from './error';
import { core } from '../../../client';

export const COLLECTION_LINKS_CREATE = 'COLLECTION_LINKS_CREATE';

export default function collectionLinksCreate(spaceId, doorwayId, sensorPlacement) {
  return async dispatch => {
    dispatch({ type: COLLECTION_LINKS_CREATE, spaceId, doorwayId, sensorPlacement });

    try {
      const link = await core.links.create({
        space_id: spaceId,
        doorway_id: doorwayId,
        sensor_placement: sensorPlacement,
      });
      dispatch(collectionLinksPush(link));
      return link;
    } catch (err) {
      dispatch(collectionLinksError(err));
      return false;
    }
  };
}
