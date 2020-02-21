import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { GlobalAction } from '../../types/rx-actions';
import { Repository, RepositoryStatus } from '../../types/repository';
import createRxStore from '..';

export type DoorwaysState = Repository<ReadonlyMap<CoreDoorway['id'], CoreDoorway>>;
export const initialState: DoorwaysState = { status: RepositoryStatus.LOADING, data: new Map() };

export function doorwaysReducer(state: DoorwaysState, action: GlobalAction): DoorwaysState {
  let newData: Map<CoreDoorway['id'], CoreDoorway>;
  switch(action.type) {
    case 'DOORWAYS_SET_ALL':
      return {
        status: RepositoryStatus.IDLE,
        data: action.data.reduce((acc, next) => acc.set(next.id, next), new Map()),
      };
    case 'DOORWAYS_SET_ONE':
      newData = new Map(state.data);
      newData.set(action.data.id, action.data);
      return {
        status: RepositoryStatus.IDLE,
        data: newData,
      };
    case 'DOORWAYS_REMOVE_ALL':
      return {
        status: RepositoryStatus.IDLE,
        data: new Map(),
      };
    case 'DOORWAYS_REMOVE_ONE':
      newData = new Map(state.data);
      newData.delete(action.id);
      return {
        status: RepositoryStatus.IDLE,
        data: newData,
      };
    default:
      return state;
  }
}

const DoorwaysStore = createRxStore('DoorwaysStore', initialState, doorwaysReducer);
export default DoorwaysStore;
