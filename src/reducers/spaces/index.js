import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SPACES_SET } from '../../actions/collection/spaces-set';
import { COLLECTION_SPACES_PUSH } from '../../actions/collection/spaces-push';

const initialState = {
  filters: {
    doorwayId: null,
  },
  loading: false,
  data: [],
};

export default function spaces(state=initialState, action) {
  switch (action.type) {

  // Update the whole space collection.
  case COLLECTION_SPACES_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(objectSnakeToCamel),
    }

  // Push an update to a space.
  case COLLECTION_SPACES_PUSH:
    return {
      ...state,
      data: action.data.map(item => {
        if (action.item.id === item.id) {
          return {...item, ...action.item};
        } else {
          return item;
        }
      }),
    }

  default:
    return state;
  }
}
