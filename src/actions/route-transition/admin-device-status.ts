import { core } from '../../client';

import collectionSpacesSet from '../collection/spaces/set';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionLinksSet from '../collection/links/set';
import collectionSensorsSet from '../collection/sensors/set';

export const ROUTE_TRANSITION_ADMIN_DEVICE_STATUS = 'ROUTE_TRANSITION_ADMIN_DEVICE_STATUS';

export default function routeTransitionAdminDeviceStatus() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVICE_STATUS });

    return Promise.all([
      // Fetch a list of all sensors.
      core.sensors.list(),
      // Fetch a list of all spaces.
      core.spaces.list(),
      // Fetch a list of all doorways.
      core.doorways.list({environment: true}),
      // Fetch a list of all links.
      core.links.list(),
    ]).then(([sensors, spaces, doorways, links]) => {
      dispatch(collectionSensorsSet(sensors.results));
      dispatch(collectionSpacesSet(spaces.results));
      dispatch(collectionDoorwaysSet(doorways.results));
      dispatch(collectionLinksSet(links.results));
    });
  };
}