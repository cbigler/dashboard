import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SPACE_HIERARCHY_SET } from '../../rx-actions/collection/space-hierarchy/set';
import createRxStore from '..';


export type SpaceHierarchyState = {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  loading: boolean,
  error: unknown,
  data: Any<FixInRefactor>[]
}

const initialState: SpaceHierarchyState = {
  view: 'LOADING',
  loading: true,
  error: null,
  data: [],
};

// FIXME: action should be GlobalAction
export function spaceHierarchyReducer(state: SpaceHierarchyState, action: Any<FixInRefactor>): SpaceHierarchyState {
  switch (action.type) {

  // Update the whole sensors collection.
  case COLLECTION_SPACE_HIERARCHY_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      error: null,
      data: action.data.map(s => objectSnakeToCamel<any>(s)),
    };

  default:
    return state;
  }
}

const SpaceHierarchyStore = createRxStore('SpaceHierarchyStore', initialState, spaceHierarchyReducer);
export default SpaceHierarchyStore;
