import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_TAGS_SET } from '../../actions/collection/tags/set';
import { COLLECTION_TAGS_ERROR } from '../../actions/collection/tags/error';

import { DensityTag } from '../../types';

const initialState = {
  view: 'LOADING',
  error: null,
  data: [],
};

export default function tags(state=initialState, action) {
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
