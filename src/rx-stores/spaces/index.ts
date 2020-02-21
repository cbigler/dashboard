import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { GlobalAction } from '../../types/rx-actions';
import { Repository, RepositoryStatus } from '../../types/repository';
import createRxStore from '..';

export type SpacesState = Repository<ReadonlyMap<CoreSpace['id'], CoreSpace>>;
export const initialState: SpacesState = { status: RepositoryStatus.LOADING, data: new Map() };

export function spacesReducer(state: SpacesState, action: GlobalAction): SpacesState {
  let newData: Map<CoreSpace['id'], CoreSpace>;
  switch(action.type) {
    case 'SPACES_SET_ALL':
      return {
        status: RepositoryStatus.IDLE,
        data: action.data.reduce((acc, next) => acc.set(next.id, next), new Map()),
      };
    case 'SPACES_SET_ONE':
      newData = new Map(state.data);
      newData.set(action.data.id, action.data);
      return {
        status: RepositoryStatus.IDLE,
        data: newData,
      };
    case 'SPACES_REMOVE_ALL':
      return {
        status: RepositoryStatus.IDLE,
        data: new Map(),
      };
    case 'SPACES_REMOVE_ONE':
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

const SpacesStore = createRxStore('SpacesStore', initialState, spacesReducer);
export default SpacesStore;
