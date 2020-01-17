import collectionSpacesSet from '../collection/spaces-legacy/set';
import collectionSensorsSet from '../collection/sensors/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreSensor } from '@density/lib-api-types/core-v2/sensors';

export const ROUTE_TRANSITION_ADMIN_DEVICE_STATUS = 'ROUTE_TRANSITION_ADMIN_DEVICE_STATUS';

export default async function routeTransitionAdminDeviceStatus(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVICE_STATUS });

  return Promise.all([
    fetchAllObjects<CoreSensor>('/sensors', { cache: false }),
    fetchAllObjects<CoreSpace>('/spaces', { cache: false })
  ]).then(([sensors, spaces]) => {
    dispatch(collectionSensorsSet(sensors));
    dispatch(collectionSpacesSet(spaces));
  });
}