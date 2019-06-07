import collectionSpacesSet from '../collection/spaces/set';
import collectionSensorsSet from '../collection/sensors/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensitySensor, DensitySpace } from '../../types';

export const ROUTE_TRANSITION_ADMIN_DEVICE_STATUS = 'ROUTE_TRANSITION_ADMIN_DEVICE_STATUS';

export default function routeTransitionAdminDeviceStatus() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_DEVICE_STATUS });

    return Promise.all([
      fetchAllObjects<DensitySensor>('/sensors'),
      fetchAllObjects<DensitySpace>('/spaces')
    ]).then(([sensors, spaces]) => {
      dispatch(collectionSensorsSet(sensors));
      dispatch(collectionSpacesSet(spaces));
    });
  };
}