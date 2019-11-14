import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_TAGS_SET } from '../../rx-actions/collection/tags/set';
import { COLLECTION_TAGS_ERROR } from '../../rx-actions/collection/tags/error';

import { DensityTag } from '../../types';
import createRxStore from '..';


export type TagsState = {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  error: unknown,
  data: DensityTag[],
}

const initialState: TagsState = {
  view: 'LOADING',
  error: null,
  data: [],
};

export function tagsReducer(state: TagsState, action: Any<FixInRefactor>): TagsState {
  switch (action.type) {

  // Update the whole tags collection.
  case COLLECTION_TAGS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      error: null,
      data: action.data.map(t => objectSnakeToCamel<DensityTag>(t)),
    };

  // An error occurred while loading tags.
  case COLLECTION_TAGS_ERROR:
    return {...state, view: 'ERROR', error: action.error};

  default:
    return state;
  }
}

const TagsStore = createRxStore('TagsStore', initialState, tagsReducer);
export default TagsStore;
