import { CoreSensor } from '@density/lib-api-types/core-v2/sensors';
import { ActionTypesOf } from '..';

const setAll = (data: Array<CoreSensor>) => ({ type: 'SENSORS_SET_ALL' as const, data });
const setOne = (data: CoreSensor) => ({ type: 'SENSORS_SET_ONE' as const, data });
const removeAll = () => ({ type: 'SENSORS_REMOVE_ALL' as const });
const removeOne = (serial_number: CoreSensor['serial_number']) => ({ type: 'SENSORS_REMOVE_ONE' as const, serial_number });

export const sensorActions = { setAll, setOne, removeAll, removeOne };
export type SensorAction = ActionTypesOf<typeof sensorActions>;
