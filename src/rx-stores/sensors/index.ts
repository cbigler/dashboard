import { CoreSensor } from '@density/lib-api-types/core-v2/sensors';
import { GlobalAction } from '../../types/rx-actions';
import { Repository, RepositoryStatus } from '../../types/repository';
import createRxStore from '..';

export type SensorsState = Repository<{
  bySerialNumber: ReadonlyMap<CoreSensor['serial_number'], CoreSensor>,
  byDoorway: ReadonlyMap<CoreSensor['doorway_id'], CoreSensor>,
}>;
export const initialState: SensorsState = {
  status: RepositoryStatus.LOADING,
  data: {
    bySerialNumber: new Map(),
    byDoorway: new Map(),
  },
};

function getWriteableData(data: SensorsState['data']) {
  return {
    bySerialNumber: new Map(data.bySerialNumber),
    byDoorway: new Map(data.byDoorway),
  };
}

export function sensorsReducer(state: SensorsState, action: GlobalAction): SensorsState {
  let item: CoreSensor | undefined;
  let newData: {
    bySerialNumber: Map<CoreSensor['serial_number'], CoreSensor>,
    byDoorway: Map<CoreSensor['doorway_id'], CoreSensor>
  };
  switch(action.type) {
    case 'SENSORS_SET_ALL':
      return {
        status: RepositoryStatus.IDLE,
        data: {
          bySerialNumber: action.data.reduce((acc, next) => acc.set(next.serial_number, next), new Map()),
          byDoorway: action.data.reduce((acc, next) => acc.set(next.doorway_id, next), new Map()),
        },
      };
    case 'SENSORS_SET_ONE':
      newData = getWriteableData(state.data);
      newData.bySerialNumber.set(action.data.serial_number, action.data);
      if (action.data.doorway_id) { newData.byDoorway.set(action.data.doorway_id, action.data); }
      return {
        status: RepositoryStatus.IDLE,
        data: newData,
      };
    case 'SENSORS_REMOVE_ALL':
      return initialState;
    case 'SENSORS_REMOVE_ONE':
      item = state.data.bySerialNumber.get(action.serial_number);
      if (item) {
        newData = getWriteableData(state.data);
        newData.bySerialNumber.delete(item.serial_number);
        newData.byDoorway.delete(item.doorway_id);
        return {
          status: RepositoryStatus.IDLE,
          data: newData,
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}

const SensorsStore = createRxStore('SensorsStore', initialState, sensorsReducer);
export default SensorsStore;
