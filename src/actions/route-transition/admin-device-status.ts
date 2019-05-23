import collectionSpacesSet from '../collection/spaces/set';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionSensorsSet from '../collection/sensors/set';
import core from '../../client/core';

export const ROUTE_TRANSITION_ADMIN_DEVICE_STATUS = 'ROUTE_TRANSITION_ADMIN_DEVICE_STATUS';

export default function routeTransitionAdminDeviceStatus() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVICE_STATUS });

    return Promise.all([
      // Fetch a list of all sensors.
      core().get('/sensors?page_size=1000'),
      // Fetch a list of all spaces.
      core().get('/spaces'),
      // Fetch a list of all doorways.
      core().get('/doorways', { params: { environment: true } }),
    ]).then(([sensors, spaces, doorways]) => {
      dispatch(collectionSensorsSet(sensors.data.results));
      dispatch(collectionSpacesSet(spaces.data.results));
      dispatch(collectionDoorwaysSet(doorways.data.results));
    });
  };
}