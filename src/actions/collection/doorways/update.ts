import collectionDoorwaysPush from './push';
import collectionDoorwaysError from './error';
import { core } from '../../../client';

export const COLLECTION_DOORWAYS_UPDATE = 'COLLECTION_DOORWAYS_UPDATE';

export default function collectionDoorwaysUpdate(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_DOORWAYS_UPDATE, item });

    try {
      const response = await core.doorways.update({
        id: item.id,
        name: item.name,
        description: item.description,
        environment: item.environment ? {
          width: item.environment.width,
          height: item.environment.height,
          clearance: item.environment.clearance,
          power_type: item.environment.powerType,
        } : {},
      });
      dispatch(collectionDoorwaysPush(response));
      return response;
    } catch (err) {
      dispatch(collectionDoorwaysError(err));
      return false;
    }
  };
}
