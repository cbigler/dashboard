import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SPACE_HIERARCHY_SET } from '../../actions/collection/space-hierarchy/set';

const initialState = {
  loading: true,
  error: null,
  data: [],
};

export default function sensors(state=initialState, action) {
  switch (action.type) {

  // Update the whole sensors collection.
  case COLLECTION_SPACE_HIERARCHY_SET:
    return {
      ...state,
      loading: false,
      error: null,
      data: action.data.map(s => objectSnakeToCamel<any>(s)),
    };

  default:
    return state;
  }
}
